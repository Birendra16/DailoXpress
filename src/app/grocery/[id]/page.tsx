import { auth } from "@/auth";
import User from "@/models/user.model";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import GroceryClientDetail from "./GroceryClientDetail";
import Order from "@/models/order.model";

export default async function GroceryPage(props: { params: Promise<{ id: string }> }) {
    await connectDB();
    const session = await auth();
    let user = null;
    let plainUser = null;
    if (session?.user?.id) {
        user = await User.findById(session.user.id);
        if (user) {
            plainUser = JSON.parse(JSON.stringify(user));
        }
    }

    const params = await props.params;
    const { id } = params;

    let grocery;
    try {
        grocery = await Grocery.findById(id).populate("reviews.userId", "name");
    } catch (error) {
        notFound();
    }

    if (!grocery) {
        notFound();
    }

    const plainGrocery = JSON.parse(JSON.stringify(grocery));

    let hasPurchased = false;
    if (user) {
        const order = await Order.findOne({
            user: user._id,
            status: "delivered",
            "items.grocery": id
        });
        if (order) {
            hasPurchased = true;
        }
    }

    return (
        <>
            {plainUser && <Nav user={plainUser} />}
            <div className="bg-linear-to-b from-green-50 to-white min-h-screen pt-20">
                <GroceryClientDetail item={plainGrocery} hasPurchased={hasPurchased} />
            </div>
            {plainUser && <Footer user={plainUser} />}
        </>
    )
}
