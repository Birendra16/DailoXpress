import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const grocerySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
    category: z.string().min(1, "Category is required"),
    unit: z.string().min(1, "Unit is required"),
    price: z.coerce.number().positive("Price must be a positive number"),
    description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description cannot exceed 500 characters").optional().or(z.literal(""))
});

export async function POST(req: NextRequest) {
    try {
        await connectDB()

        const session = await auth()
        if (session?.user?.role !== "admin") {
            return NextResponse.json(
                { message: "you are not admin" },
                { status: 400 }
            )
        }

        const formData = await req.formData()
        const name = formData.get("name") as string
        const category = formData.get("category") as string
        const unit = formData.get("unit") as string
        const price = formData.get("price") as string
        const file = formData.get("image") as Blob | null
        const description = formData.get("description") as string

        const validation = grocerySchema.safeParse({ name, category, unit, price, description })
        if (!validation.success) {
            return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 })
        }

        let imageUrl
        if (file) {
            imageUrl = await uploadOnCloudinary(file)
        }

        const grocery = await Grocery.create({
            name, price, category, unit, description, image: imageUrl
        })

        return NextResponse.json(
            grocery,
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: `add grocery error ${error}` },
            { status: 500 }
        )
    }

}