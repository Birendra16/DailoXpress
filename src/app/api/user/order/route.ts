import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";
import { aj } from "@/lib/arcjet";
import { fixedWindow, detectBot } from "@arcjet/next";
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

const ajRule = aj
    .withRule(detectBot({ mode: "LIVE", allow: [] }))
    .withRule(fixedWindow({ mode: "LIVE", max: 3, window: "1m" }));

export async function POST(req: NextRequest) {
    try {
        const decision = await ajRule.protect(req);
        if (decision.isDenied()) {
            return NextResponse.json({ message: "Too many order requests. Please slow down." }, { status: 429 });
        }

        await connectDB();

        // 1. Get authenticated user ID from session securely
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const { items, paymentMethod, address } = body;

        if (!items || !items.length || !paymentMethod || !address) {
            return NextResponse.json(
                { message: "please send all credentials" },
                { status: 400 }
            );
        }

        const addressValidation = addressSchema.safeParse(address);
        if (!addressValidation.success) {
            return NextResponse.json(
                { message: addressValidation.error.issues[0].message },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { message: "user not found" },
                { status: 400 }
            );
        }

        // 2. Validate prices and calculate total amount securely
        let subTotal = 0;
        const verifiedItems = [];

        for (const item of items) {
            const dbGrocery = await Grocery.findById(item.grocery);
            if (!dbGrocery) {
                return NextResponse.json({ message: `Item not found: ${item.name}` }, { status: 404 });
            }

            const verifiedPrice = dbGrocery.price;
            subTotal += verifiedPrice * item.quantity;

            verifiedItems.push({
                ...item,
                price: dbGrocery.price,
                name: dbGrocery.name,
                image: dbGrocery.image,
                unit: dbGrocery.unit
            });
        }

        const deliveryFee = subTotal > 500 ? 0 : 50;
        const verifiedTotalAmount = subTotal + deliveryFee;

        const newOrder = await Order.create({
            user: userId,
            items: verifiedItems,
            paymentMethod,
            totalAmount: verifiedTotalAmount,
            address
        });

        await emitEventHandler("new-order", newOrder);

        return NextResponse.json(
            newOrder,
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: `place order error ${error}` },
            { status: 500 }
        );
    }
}