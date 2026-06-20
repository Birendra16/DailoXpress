
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { aj } from "@/lib/arcjet";

export async function proxy(req: NextRequest) {
    // Arcjet global security check
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            return NextResponse.json({ error: "Global rate limit exceeded" }, { status: 429 });
        }
        return NextResponse.json({ error: "Access Forbidden by Firewall" }, { status: 403 });
    }


    const { pathname } = req.nextUrl

    const publicRoutes = ["/login", "/register", "/api/auth"]
    if (publicRoutes.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    const session = await auth()

    if (!session) {
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", req.url)
        return NextResponse.redirect(loginUrl)
    }

    const role = session.user?.role

    if (pathname.startsWith("/user") && role !== "user") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    }



    return NextResponse.next()

}

export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
}