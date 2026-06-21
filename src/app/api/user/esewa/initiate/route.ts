import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import Grocery from "@/models/grocery.model";
import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";

const addressSchema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters").max(50, "Name cannot exceed 50 characters"),
    mobile: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone must contain only numbers"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pinCode: z.string().optional(),
    fullAddress: z.string().min(5, "Full address is required"),
    latitude: z.number(),
    longitude: z.number()
});

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

        // 1. Get authenticated user ID from session securely
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const { items, address } = body;

        if (!items || !items.length || !address) {
            return NextResponse.json(
                { message: `Missing fields: ${!items ? 'items ' : ''} ${!address ? 'address' : ''}` },
                { status: 400 }
            );
        }

        const addressValidation = addressSchema.safeParse(address);
        if (!addressValidation.success) {
            return NextResponse.json(
                { message: addressValidation.error.issues[0].message },
                { status: 400 }
            )
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // 2. Validate prices and calculate subTotal securely
        let calculatedSubTotal = 0;
        const verifiedItems = [];

        for (const item of items) {
            const dbGrocery = await Grocery.findById(item.grocery);
            if (!dbGrocery) {
                return NextResponse.json({ message: `Item not found: ${item.name}` }, { status: 404 });
            }

            const verifiedPrice = dbGrocery.price;
            calculatedSubTotal += verifiedPrice * item.quantity;

            verifiedItems.push({
                ...item,
                price: dbGrocery.price,
                name: dbGrocery.name,
                image: dbGrocery.image,
                unit: dbGrocery.unit
            });
        }

        const calculatedDeliveryFee = calculatedSubTotal > 500 ? 0 : 50;
        const calculatedTotalAmount = calculatedSubTotal + calculatedDeliveryFee;

        // Generate a unique transaction UUID: YYYYMMDD-HHMMSS-random
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const transactionUuid = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${Math.floor(Math.random() * 9000) + 1000}`;

        const productCode = process.env.ESEWA_PRODUCT_CODE!;

        const amount = calculatedSubTotal;
        const delivery = calculatedDeliveryFee;
        const total = calculatedTotalAmount;

        // eSewa requires total_amount as a string (strict UAT validation)
        // Signature is computed on the exact string used in the form
        const totalAmountStr = total.toString();
        const signature = generateEsewaSignature(totalAmountStr, transactionUuid, productCode);

        // Persist a PENDING order so we can update it after callback
        const newOrder = await Order.create({
            user: userId,
            items: verifiedItems,
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
