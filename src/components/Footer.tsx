"use client"
import { Mail, MapPin, Phone } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa"

interface IUser {
    role?: "user" | "deliveryBoy" | "admin" | string;
}

function Footer({ user }: { user?: IUser | null }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-linear-to-r from-green-600 to-green-700 text-white mt-16"
        >
            <div className="w-[90%] md:w-[80%] mx-auto py-6 grid grid-cols-1 md:grid-cols-3 gap-10
        border-b border-green-500/40">

                <div>
                    <h2 className="text-2xl font-bold mb-2">DailoXpress</h2>
                    <p className="text-sm text-green-100 leading-relaxed">
                        Your one-stop online grocery store delivering freshness to your doorstep.
                        Shop smart, eat fresh, and save more every day!
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
                    <ul className="space-y-2 text-green-100 text-sm">
                        {(!user || user.role === "user") && (
                            <>
                                <li><Link href={"/"} className="hover:text-white transition">Home</Link></li>
                                <li><Link href={"/user/cart"} className="hover:text-white transition">Cart</Link></li>
                                <li><Link href={"/user/my-orders"} className="hover:text-white transition">My Orders</Link></li>
                            </>
                        )}
                        {user?.role === "admin" && (
                            <>
                                <li><Link href={"/"} className="hover:text-white transition">Home</Link></li>
                                <li><Link href={"/admin/add-grocery"} className="hover:text-white transition">Add Grocery</Link></li>
                                <li><Link href={"/admin/view-grocery"} className="hover:text-white transition">View Grocery</Link></li>
                                <li><Link href={"/admin/manage-orders"} className="hover:text-white transition">Manage Orders</Link></li>
                            </>
                        )}
                        {user?.role === "deliveryBoy" && (
                            <>
                                <li><Link href={"/"} className="hover:text-white transition">Home</Link></li>
                            </>
                        )}
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
                    <ul className="space-y-2 text-green-100 text-sm">
                        <li className="flex items-center gap-2">
                            <MapPin size={14} /> Koteshwor, Kathmandu
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone size={14} /> +977 9821614509
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail size={14} /> bbirendra693@gmail.com
                        </li>
                    </ul>
                    <div className="flex gap-4 mt-4">
                        <Link href="https://facebook.com" target="_blank">
                            <FaFacebook className="w-5 h-5 hover:text-white transition" />
                        </Link>
                        <Link href="https://facebook.com" target="_blank">
                            <FaLinkedin className="w-5 h-5 hover:text-white transition" />
                        </Link>
                        <Link href="https://facebook.com" target="_blank">
                            <FaInstagram className="w-5 h-5 hover:text-white transition" />
                        </Link>
                    </div>
                </div>

            </div>

            <div className="text-center py-4 text-sm text-green-100 bg-green-800/40">
                ©{new Date().getFullYear()} <span className="font-semibold">
                    DailoXpress
                </span>. All rights reserved.
            </div>

        </motion.div>
    )
}

export default Footer