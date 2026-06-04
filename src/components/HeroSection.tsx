"use client"

import { Leaf, ShoppingBasket, Smartphone, Truck } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import { useEffect, useState } from "react"

function HeroSection() {

    const slides = [
        {
            id: 1,
            icon: <Leaf className="w-16 h-16 sm:w-24 sm:h-24 text-green-400 drop-shadow-lg" />,
            title: "Fresh Organic Groceries 🥦",
            subtitle: "Farm-fresh fruits, vegetables, and daily essentials delivered to you.",
            btnText: "Shop Now",
            bg: "https://plus.unsplash.com/premium_photo-1663012860167-220d9d9c8aca?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            id: 2,
            icon: <Truck className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-400 drop-shadow-lg" />,
            title: "Fast & Reliable Delivery 🚚",
            subtitle: "We ensure your groceries reach your doorstep in no time",
            btnText: "Order Now",
            bg: "https://images.unsplash.com/photo-1683553170878-049f180627b0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEZhc3QlMjBHcm9jZXJ5JTIwRGVsaXZlcnl8ZW58MHx8MHx8fDA%3D"

        },
        {
            id: 3,
            icon: <Smartphone className="w-16 h-16 sm:w-24 sm:h-24 text-blue-400 drop-shadow-lg" />,
            title: "Shop Anytime, Anywhere 📱",
            subtitle: "Easy and seamless online grocery shopping experience.",
            btnText: "Get Started ",
            bg: "https://plus.unsplash.com/premium_photo-1670002415458-a5b2816bb79c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzN8fEZyZXNoJTIwT3JnYW5pYyUyMEdyb2Nlcmllc3xlbnwwfHwwfHx8MA%3D%3D"
        },
    ]

    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % (slides.length))
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="relative w-[95%] mx-auto mt-28 h-[calc(100svh-8rem)] min-h-[400px] rounded-3xl overflow-hidden shadow-2xl">

            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={slides[current].bg}
                        fill
                        alt="slide"
                        priority
                        sizes="95vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />

                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex items-center justify-center text-center
        text-white px-6">

                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center justify-center gap-4 max-w-4xl"
                >
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-full shadow-lg">
                        {slides[current].icon}
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight
                drop-shadow-lg">{slides[current].title}</h1>
                    <p className="text-lg sm:text-xl text-gray-200 max-w-2xl">
                        {slides[current].subtitle}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.09 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 bg-white text-green-700 hover:bg-green-100 px-8 py-3 rounded-full
                font-semibold shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                        <ShoppingBasket className="w-5 h-5" />
                        {slides[current].btnText}
                    </motion.button>

                </motion.div>

            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all ${index === current ? "bg-white w-6" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>

        </div>
    )
}

export default HeroSection