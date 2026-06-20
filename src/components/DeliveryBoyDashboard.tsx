"use client"

import { getSocket } from "@/lib/socket"
import { RootState } from "@/redux/store"
import axios from "axios"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import dynamic from "next/dynamic"
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
    ssr: false
})
import DeliveryChat from "./DeliveryChat"
import { Loader } from "lucide-react"
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ILocation {
    latitude: number,
    longitude: number
}

function DeliveryBoyDashboard({ earning }: { earning: number }) {

    const [assignments, setAssignments] = useState<any[]>([])
    const { userData } = useSelector((state: RootState) => state.user)
    const [activeOrder, setActiveOrder] = useState<any>(null)
    const [showOtpBox, setShowOtpBox] = useState(false)
    const [otp, setOtp] = useState("")
    const [otpError, setOtpError] = useState("")
    const [sendOtpLoading, setSendOtpLoading] = useState(false)
    const [verifyOtpLoading, setVerifyOtpLoading] = useState(false)


    const [userLocation, setUserLocation] = useState<ILocation>(
        {
            latitude: 0,
            longitude: 0
        }
    )
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>(
        {
            latitude: 0,
            longitude: 0
        }
    )

    const fetchAssignments = async () => {
        try {
            const result = await axios.get("/api/delivery/get-assignments")
            setAssignments(result.data)

        } catch (error) {
            setOtpError("Otp Verification Error")
        }
    }


    useEffect(() => {

        const socket = getSocket()

        if (!userData?._id) return
        if (!navigator.geolocation) return

        const watcher = navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude
            const lon = pos.coords.longitude

            setDeliveryBoyLocation({
                latitude: lat,
                longitude: lon
            })

            socket.emit("update-location", {
                userId: userData._id,
                latitude: lat,
                longitude: lon
            })
        }, (err) => {
            console.log(err)
        }, { enableHighAccuracy: true })

        return () => navigator.geolocation.clearWatch(watcher)
    }, [userData?._id])


    useEffect((): any => {
        const socket = getSocket()

        socket.on("new-assignment", (deliveryAssignment) => {
            setAssignments((prev) => [...prev, deliveryAssignment])
        })

        return () => socket.off("new-assignment")
    }, [])


    const handleAccept = async (id: string) => {
        try {
            const result = await axios.get(`/api/delivery/assignment/${id}/accept-assignment`)
            fetchCurrentOrder()
        } catch (error) {
            console.log(error)
        }
    }

    const fetchCurrentOrder = async () => {
        try {
            const result = await axios.get("/api/delivery/current-order")
            if (result.data.active) {
                setActiveOrder(result.data.assignment)
                setUserLocation({
                    latitude: result.data.assignment.order.address.latitude,
                    longitude: result.data.assignment.order.address.longitude
                })
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchAssignments()
        fetchCurrentOrder()

    }, [userData])


    useEffect((): any => {
        const socket = getSocket()
        socket.on("update-deliveryBoy-location", ({ userId, location }) => {
            setDeliveryBoyLocation({
                latitude: location.coordinates[1],
                longitude: location.coordinates[0]
            })
        })

        return () => socket.off("update-deliveryBoy-location")
    }, [])


    const sendOtp = async () => {
        setSendOtpLoading(true)
        try {
            const result = await axios.post("/api/delivery/otp/send",
                { orderId: activeOrder.order._id }
            )

            setShowOtpBox(true)
            setSendOtpLoading(false)

        } catch (error) {
            console.log(error)
            setSendOtpLoading(false)
        }
    }

    const verifyOtp = async () => {
        setVerifyOtpLoading(true)
        try {
            const result = await axios.post("/api/delivery/otp/verify",
                { orderId: activeOrder.order._id, otp }
            )

            setActiveOrder(null)
            setVerifyOtpLoading(false)

            await fetchCurrentOrder()
            window.location.reload()

        } catch (error) {
            setOtpError("Otp Verification Error")
            setVerifyOtpLoading(false)
        }
    }

    if (!activeOrder && assignments.length === 0) {

        const todayEarning = [
            {
                name: "Today",
                earning,
                deliveries: earning / 50
            }
        ]

        return (
            <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-white
             to-green-50 p-2 pt-20">
                <div className="max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-800">No Active Deliveries 🚛</h2>
                    <p className="text-gray-500 mb-3">Stay online to receive new orders</p>

                    <div className="bg-white border rounded-xl shadow-xl p-3">
                        <h2 className="font-medium text-green-700 mb-1">Today's Performance</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={todayEarning}>
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" orientation="left" stroke="#16a34a" />
                                <YAxis yAxisId="right" orientation="right" stroke="#2563eb" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="earning" name="Earnings (रु)" fill="#16a34a" />
                                <Bar yAxisId="right" dataKey="deliveries" name="Deliveries" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>

                        <p className="mt-1 text-lg font-bold text-green-700">
                            {earning || 0} Earned today
                        </p>
                        <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-1
                 rounded-lg"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Earning
                        </button>

                    </div>

                </div>
            </div>
        )
    }


    if (activeOrder && userLocation) {
        return (
            <div className="p-4 mt-20 min-h-screen-bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-green-700 mb-2">Active Delivery</h1>
                    <p className="text-gray-600 text-sm mb-4">order#{activeOrder.order._id.slice(-6)}</p>

                    <div className="rounded-xl border shadow-lg overflow-hidden mb-4">
                        <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
                    </div>
                    <DeliveryChat orderId={activeOrder.order._id} deliveryBoyId={userData?._id?.toString()!} />

                    <div className="mt-4 bg-white rounded-xl border shadow p-2 ">
                        {!activeOrder.order.deliveryOtpVerification && !showOtpBox && (
                            <button
                                onClick={sendOtp}
                                className="w-full py-2 bg-green-600 text-center text-white rounded-lg">
                                {sendOtpLoading ? <Loader size={14} className="animate-spin text-white text-center" /> : "Mark as Delivered"}
                            </button>
                        )}
                        {
                            showOtpBox &&
                            <div className="mt-4">
                                <input type="text"
                                    className="w-full py-2  border rounded-lg text-center"
                                    placeholder="Enter Otp" maxLength={4}
                                    onChange={(e) => setOtp(e.target.value)}
                                    value={otp}
                                />
                                <button
                                    className="w-full mt-4 bg-blue-600 text-center text-white py-2 rounded-lg "
                                    onClick={verifyOtp}
                                >
                                    {verifyOtpLoading ? <Loader size={14} className="animate-spin text-white text-center" /> : "Verify OTP"}
                                </button>
                                {otpError && <div className="text-red-600 mt-2">{otpError}</div>}
                            </div>
                        }

                        {activeOrder.order.deliveryOtpVerification &&
                            <div className="text-green-700 text-center font-bold">Delivery Completed!</div>
                        }

                    </div>

                </div>
            </div>
        )
    }


    return (
        <div className="w-full min-h-screen bg-gray-50 p-4">

            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mt-20 mb-4">Delivery Assignments</h2>
                {assignments.map(a => (
                    <div key={a._id} className="p-4 bg-white rounded-xl shadow mb-4 border">
                        <p><b>Order Id </b> #{a?.order._id.slice(-6)}</p>
                        <p className="text-gray-600">{a.order.address.fullAddress}</p>

                        <div className="flex gap-3 mt-2">
                            <button className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                                onClick={() => handleAccept(a._id)}
                            >
                                Accept
                            </button>
                            <button className="flex-1 bg-red-600 text-white py-2 rounded-lg">
                                Reject
                            </button>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    )
}

export default DeliveryBoyDashboard