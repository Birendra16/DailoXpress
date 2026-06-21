import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const editRoleSchema = z.object({
    role: z.enum(["admin", "user", "deliveryBoy"]),
    mobile: z.string().length(10, "Mobile number must be exactly 10 digits").regex(/^\d+$/, "Mobile must contain only numbers")
});

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const body = await req.json()
        const validation = editRoleSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.issues[0].message },
                { status: 400 }
            )
        }
        const { role, mobile } = validation.data
        const session = await auth()
        const user = await User.findOneAndUpdate({ email: session?.user?.email }, {
            role, mobile
        }, { returnDocument: 'after' })

        if (!user) {
            return NextResponse.json(
                { message: "user not found" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            user,
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: `edit role and mobile error ${error}` },
            { status: 500 }
        )
    }
}