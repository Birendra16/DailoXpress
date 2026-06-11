"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "motion/react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useDispatch } from "react-redux"
import { clearCart } from "@/redux/slices/cartSlice"

type State = "loading" | "success" | "error"

export default function EsewaSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const dispatch = useDispatch()
    const [state, setState] = useState<State>("loading")
    const [message, setMessage] = useState("")

    useEffect(() => {
        const data = searchParams.get("data")
        if (!data) {
            setState("error")
            setMessage("No payment response received from eSewa.")
            return
        }

        const verify = async () => {
            try {
                const res = await axios.get(`/api/user/esewa/verify?data=${data}`)
                if (res.data.success) {
                    dispatch(clearCart())
                    setState("success")
                    setMessage(res.data.message || "Payment verified!")
                } else {
                    setState("error")
                    setMessage(res.data.message || "Verification failed.")
                }
            } catch (err: unknown) {
                const errMsg =
                    axios.isAxiosError(err)
                        ? err.response?.data?.message ?? "Server error during verification."
                        : "Unexpected error."
                setState("error")
                setMessage(errMsg)
            }
        }

        verify()
    }, [searchParams, dispatch])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
            >
                {state === "loading" && (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="inline-block mb-6"
                        >
                            <Loader2 className="text-green-500" size={64} />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h1>
                        <p className="text-gray-500">Please wait while we confirm your eSewa payment…</p>
                    </>
                )}

                {state === "success" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12 }}
                            className="mb-6"
                        >
                            <CheckCircle className="text-green-500 mx-auto" size={80} />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-green-700 mb-2">Payment Successful!</h1>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => router.push("/user/order-success")}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition-all"
                        >
                            View Order
                        </motion.button>
                    </>
                )}

                {state === "error" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12 }}
                            className="mb-6"
                        >
                            <XCircle className="text-red-500 mx-auto" size={80} />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-red-600 mb-2">Payment Failed</h1>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => router.push("/user/checkout")}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-full transition-all"
                        >
                            Try Again
                        </motion.button>
                    </>
                )}
            </motion.div>
        </div>
    )
}
