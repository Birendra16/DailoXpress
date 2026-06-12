"use client"

import AdminOrderCard from "@/components/AdminOrderCard"
import { IOrder } from "@/models/order.model"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


function ManageOrders() {

    const [orders, setOrders] = useState<IOrder[]>()
    const router = useRouter()

    useEffect(() => {
        const getOrders = async () => {
            try {
                const result = await axios.get("/api/admin/get-orders")
                setOrders(result.data)

            } catch (error) {
                console.log(error)
            }
        }

        getOrders()

    }, [])

    return (
        <div className="min-h-screen bg-gray-50 w-full">

            <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
                <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-2">

                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition"
                        onClick={() => router.push("/")}
                    >
                        <ArrowLeft size={20} className="text-green-700" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800">Manage Orders</h1>

                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-18 pb-14 space-y-6">
                 <div className="space-y-4">
                {orders?.map((order,index)=>(
                    <AdminOrderCard key={index} order={order}/>
                ))}
            </div>
            </div>
           

        </div>
    )
}

export default ManageOrders