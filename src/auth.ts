import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDB from "./lib/db"
import User from "./models/user.model"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"
import { z } from "zod"

const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required")
})

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "email", type: "email" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials, request) {
                const validation = loginSchema.safeParse(credentials)
                if (!validation.success) {
                    throw new Error(validation.error.issues[0].message)
                }

                await connectDB()
                const email = validation.data.email
                const password = validation.data.password
                const user = await User.findOne({ email })

                if (!user) {
                    throw new Error("user does not exist")
                }

                const isMatch = await bcrypt.compare(password, user.password)

                if (!isMatch) {
                    throw new Error("incorrect password")
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {

        async signIn({ user, account }) {
            if (account?.provider == "google") {
                await connectDB()

                let dbUser = await User.findOne({ email: user.email })

                if (!dbUser) {
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email,
                        image: user.image
                    })
                }

                user.id = dbUser._id.toString()
                user.role = dbUser.role
                user.image = dbUser.image
            }
            return true
        },
        // token ko vitra user ko data rakchha
        jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id,
                    token.name = user.name,
                    token.email = user.email
                token.role = user.role
                token.image = user.image
            }

            if (trigger == "update") {
                token.role = session.role
            }

            return token
        },

        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string,
                    session.user.name = token.name as string,
                    session.user.email = token.email as string,
                    session.user.role = token.role as string,
                    session.user.image = token.image as string | undefined
            }
            return session

        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 10 * 24 * 60 * 60
    },
    secret: process.env.AUTH_SECRET
})