import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/user/esewa/verify?data=<base64-encoded-response>
 *
 * eSewa redirects to success_url with a `data` query param that is Base64-encoded JSON.
 * We decode it, call the eSewa status-check API to confirm the payment is COMPLETE,
 * then mark the order as paid.
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const dataB64 = searchParams.get("data");

        if (!dataB64) {
            return NextResponse.json(
                { message: "Missing data parameter" },
                { status: 400 }
            );
        }

        // Decode the Base64 response from eSewa
        const decoded = JSON.parse(Buffer.from(dataB64, "base64").toString("utf-8")) as {
            transaction_code: string;
            status: string;
            total_amount: string;
            transaction_uuid: string;
            product_code: string;
            signed_field_names: string;
            signature: string;
        };

        const { transaction_uuid, total_amount, product_code, status } = decoded;

        if (status !== "COMPLETE") {
            return NextResponse.json(
                { message: `Payment not complete. Status: ${status}` },
                { status: 400 }
            );
        }

        // Double-check with eSewa status API
        const statusUrl = `${process.env.ESEWA_STATUS_URL}/?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
        const esewaRes = await fetch(statusUrl);
        const esewaData = await esewaRes.json();

        if (esewaData.status !== "COMPLETE") {
            return NextResponse.json(
                { message: `eSewa verification failed. Status: ${esewaData.status}` },
                { status: 400 }
            );
        }

        // Find the matching pending order and mark it paid
        const order = await Order.findOneAndUpdate(
            { transactionUuid: transaction_uuid, isPaid: false },
            { isPaid: true },
            { returnDocument: "after" }
        );

        if (!order) {
            return NextResponse.json(
                { message: "Order not found or already processed" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            orderId: order._id,
            message: "Payment verified and order confirmed!",
        });
    } catch (error) {
        return NextResponse.json(
            { message: `eSewa verification error: ${error}` },
            { status: 500 }
        );
    }
}
