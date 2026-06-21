import connectDB from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { aj } from "@/lib/arcjet";
import { fixedWindow, detectBot } from "@arcjet/next";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(30, "Name cannot exceed 30 characters"),
    email: z.email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(/^[A-Z]/, "Password must start with a capital letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
});

const ajRule = aj
    .withRule(detectBot({ mode: "LIVE", allow: [] }))
    .withRule(fixedWindow({ mode: "LIVE", max: 3, window: "10m" }));

export async function POST(req: NextRequest) {
    try {
        const decision = await ajRule.protect(req);
        if (decision.isDenied()) {
            return NextResponse.json(
                { message: "Registration limit exceeded or bot detected. Please try again later." },
                { status: 429 }
            );
        }

        await connectDB();

        const body = await req.json();
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, email, password } = validation.data;

        const existUser = await User.findOne({ email })

        if (existUser) {
            return NextResponse.json(
                { message: "email already exist!" },
                { status: 400 }
            )
        }



        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        return NextResponse.json(
            user,
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: `register error ${error}` },
            { status: 500 }
        )
    }

}