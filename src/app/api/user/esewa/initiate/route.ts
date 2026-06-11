import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generates the HMAC-SHA256 signature required by eSewa.
 * Message format: total_amount=X,transaction_uuid=Y,product_code=Z
 */
function generateEsewaSignature(
    totalAmount: string,
    transactionUuid: string,
    productCode: string
): string {
    const secretKey = process.env.ESEWA_SECRET_KEY!;
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hmac = createHmac("sha256", secretKey);
    hmac.update(message);
    return hmac.digest("base64");
}

/**
 * POST /api/user/esewa/initiate
 * Creates a pending order and returns the signed eSewa form parameters.
 * The client must POST these fields to the eSewa payment URL via a form submit.
 */
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { userId, items, totalAmount, subTotal, deliveryFee, address } = await req.json();

        if (!items || !userId || !totalAmount || subTotal === undefined || !address) {
            return NextResponse.json(
                { message: `Missing fields: ${!userId?'userId ':''} ${!items?'items ':''} ${!totalAmount?'totalAmount ':''} ${subTotal === undefined?'subTotal ':''} ${!address?'address':''}` },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Generate a unique transaction UUID: YYYYMMDD-HHMMSS-random
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const transactionUuid = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${Math.floor(Math.random() * 9000) + 1000}`;

        const productCode = process.env.ESEWA_PRODUCT_CODE!;

        const amount = Number(subTotal);
        const delivery = Number(deliveryFee ?? 0);
        const total = amount + delivery;
        const clientTotal = Number(totalAmount);

        if (!Number.isFinite(amount) || !Number.isFinite(delivery) || !Number.isFinite(clientTotal)) {
            return NextResponse.json(
                { message: "Invalid eSewa amount values" },
                { status: 400 }
            );
        }

        if (clientTotal !== total) {
            return NextResponse.json(
                { message: "eSewa total mismatch", amount, delivery, total, clientTotal },
                { status: 400 }
            );
        }

        // eSewa requires total_amount as a string (strict UAT validation)
        // Signature is computed on the exact string used in the form
        const totalAmountStr = total.toString();
        const signature = generateEsewaSignature(totalAmountStr, transactionUuid, productCode);

        // Persist a PENDING order so we can update it after callback
        const newOrder = await Order.create({
            user: userId,
            items,
            paymentMethod: "online",
            totalAmount: total,
            address,
            transactionUuid,
            isPaid: false,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

        return NextResponse.json({
            orderId: newOrder._id,
            esewaParams: {
                // eSewa: amount = base price, product_delivery_charge = delivery fee
                // All values MUST be strings for UAT validation to pass
                amount: String(amount),
                tax_amount: "0",
                total_amount: totalAmountStr,
                transaction_uuid: transactionUuid,
                product_code: productCode,
                product_service_charge: "0",
                product_delivery_charge: String(delivery),
                success_url: `${appUrl}/user/esewa-success`,
                failure_url: `${appUrl}/user/checkout`,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature,
            },
            paymentUrl: process.env.ESEWA_PAYMENT_URL!,
        });
    } catch (error) {
        return NextResponse.json(
            { message: `eSewa initiation error: ${error}` },
            { status: 500 }
        );
    }
}
