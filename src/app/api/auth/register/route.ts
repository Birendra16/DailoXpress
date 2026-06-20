import connectDB from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { aj } from "@/lib/arcjet";
import { fixedWindow, detectBot } from "@arcjet/next";

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

        const { name, email, password } = await req.json();

        const existUser = await User.findOne({ email })

        if (existUser) {
            return NextResponse.json(
                { message: "email already exist!" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "password must be at least 6 characters" },
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