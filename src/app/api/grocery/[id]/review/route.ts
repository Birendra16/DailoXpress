import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reviewSchema = z.object({
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z.string().min(5, "Comment must be at least 5 characters").max(500, "Comment cannot exceed 500 characters")
});

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const params = await props.params;
        const { id } = params;
        const body = await req.json();
        const validation = reviewSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
        }

        const { rating, comment } = validation.data;

        const userId = session.user.id;

        // Check if user has actually purchased and it's delivered
        const order = await Order.findOne({
            user: userId,
            status: "delivered",
            "items.grocery": id
        });

        if (!order) {
            return NextResponse.json({ message: "You must purchase and receive this product before reviewing" }, { status: 403 });
        }

        const grocery = await Grocery.findById(id);

        if (!grocery) {
            return NextResponse.json({ message: "Grocery not found" }, { status: 404 });
        }

        // Check if already reviewed
        const alreadyReviewed = grocery.reviews.find(
            (r: any) => r.userId.toString() === userId.toString()
        );

        if (alreadyReviewed) {
            return NextResponse.json({ message: "You have already reviewed this product" }, { status: 400 });
        }

        const review = {
            userId,
            rating: Number(rating),
            comment
        };

        grocery.reviews.push(review);
        grocery.numReviews = grocery.reviews.length;

        // Calculate new average rating
        grocery.rating = grocery.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / grocery.reviews.length;

        await grocery.save();

        return NextResponse.json({ message: "Review added successfully" }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
