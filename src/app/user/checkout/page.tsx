"use client"

import { RootState } from "@/redux/store"
import { ArrowLeft, Building, CreditCard, CreditCardIcon, Home, Loader, LocateFixed, MapPin, Navigation, Phone, Pin, Truck, User } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import axios from "axios"
import dynamic from 'next/dynamic'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useSession } from "next-auth/react"

const CheckoutMap = dynamic(() => import("@/components/CheckoutMap"), {
    ssr: false,
    loading: () => <div>Loading map...</div>
})


function Checkout() {

    const router = useRouter()
    const { status } = useSession()
    
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/user/checkout")
        }
    }, [status, router])

    const { userData } = useSelector((state: RootState) => state.user)
    const { subTotal, deliveryFee, finalTotal, cartData } = useSelector((state: RootState) => state.cart)
    const formik = useFormik({
        initialValues: {
            fullName: "",
            mobile: "",
            city: "",
            state: "",
            pinCode: "",
            fullAddress: ""
        },
        validationSchema: Yup.object({
            fullName: Yup.string().min(3, "Min 3 chars").max(50, "Max 50 chars").required("Required"),
            mobile: Yup.string().length(10, "Must be exactly 10 digits").matches(/^\d+$/, "Numbers only").required("Required"),
            city: Yup.string().required("Required"),
            state: Yup.string().required("Required"),
            pinCode: Yup.string(),
            fullAddress: Yup.string().min(5, "Min 5 chars").required("Required")
        }),
        onSubmit: async (values) => {
            if (paymentMethod === "cod") {
                await handleCod(values)
            } else {
                await handleEsewa(values)
            }
        }
    })

    const [position, setPosition] = useState<[number, number] | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchLoading, setSearchLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod")
    const [esewaLoading, setEsewaLoading] = useState(false)


    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords
                setPosition([latitude, longitude])
            }, (err) => {
                console.log("location error", err)
            },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            )
        }
    }, [])


    useEffect(() => {
        if (userData) {
            formik.setFieldValue("fullName", userData.name || "")
            formik.setFieldValue("mobile", userData.mobile || "")
        }
    }, [userData])



    const handleSearchQuery = async () => {
        setSearchLoading(true)
        const { OpenStreetMapProvider } = await import("leaflet-geosearch")
        const provider = new OpenStreetMapProvider()
        const results = await provider.search({ query: searchQuery });
        if (results) {
            setSearchLoading(false)
            setPosition([results[0].y, results[0].x])
        }

    }

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords
                setPosition([latitude, longitude])
            }, (err) => {
                console.log("location error", err)
            },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            )
        }
    }

    const handleCod = async (values: any) => {
        if (!position) {
            alert("Please select your delivery location on the map.")
            return null
        }

        try {
            // userId and totalAmount are now derived securely on the server
            await axios.post("/api/user/order", {
                items: cartData.map(item => ({
                    grocery: item._id,
                    quantity: item.quantity,
                })),
                address: {
                    fullName: values.fullName,
                    mobile: values.mobile,
                    city: values.city,
                    state: values.state,
                    fullAddress: values.fullAddress,
                    pinCode: values.pinCode,
                    latitude: position[0],
                    longitude: position[1]
                },
                paymentMethod
            })

            router.push("/user/order-success")

        } catch (error) {
            console.log(error)
        }
    }


    const handleEsewa = async (values: any) => {
        if (!position) {
            alert("Please select your delivery location on the map.")
            return
        }

        setEsewaLoading(true)
        try {
            // userId, subTotal, deliveryFee, totalAmount are now derived securely on the server
            const res = await axios.post("/api/user/esewa/initiate", {
                items: cartData.map(item => ({
                    grocery: item._id,
                    quantity: item.quantity,
                })),
                address: {
                    fullName: values.fullName,
                    mobile: values.mobile,
                    city: values.city,
                    state: values.state,
                    fullAddress: values.fullAddress,
                    pinCode: values.pinCode,
                    latitude: position[0],
                    longitude: position[1]
                }
            })

            const { esewaParams, paymentUrl } = res.data

            // eSewa requires a browser form POST — we create and submit one dynamically
            const form = document.createElement("form")
            form.method = "POST"
            form.action = paymentUrl

            Object.entries(esewaParams).forEach(([key, value]) => {
                const input = document.createElement("input")
                input.type = "hidden"
                input.name = key
                input.value = String(value)
                form.appendChild(input)
            })

            document.body.appendChild(form)
            form.submit()
        } catch (error) {
            console.error("eSewa initiation failed:", error)
            setEsewaLoading(false)
        }
    }

    useEffect(() => {
        const fetchAddress = async () => {

            if (!position) return

            try {
                const result = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`)
                console.log(result.data)
                formik.setFieldValue("city", result.data.address.city || "")
                formik.setFieldValue("state", result.data.address.state || "")
                formik.setFieldValue("pinCode", result.data.address.postcode || "")
                formik.setFieldValue("fullAddress", result.data.display_name || "")
            } catch (error) {
                console.log(error)
            }
        }
        fetchAddress()
    }, [position])

    if (status === "loading") {
        return <div className="flex justify-center items-center min-h-screen"><Loader className="animate-spin text-green-600 w-8 h-8" /></div>
    }

    if (status === "unauthenticated") {
        return null
    }

    return (
        <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">

            <motion.button
                whileTap={{ scale: 0.97 }}
                className="absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 
        font-semibold"
                onClick={() => router.push("/user/cart")}
            >
                <ArrowLeft size={16} />
                <span>Back to cart</span>
            </motion.button>

            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
            >
                Checkout
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all 
            duration-300 p-6 border border-gray-100"
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="text-green-700" /> Delivery Address
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-green-600" size={18} />
                                <input type="text" placeholder="Full Name"
                                    {...formik.getFieldProps('fullName')}
                                    className={`pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50 focus:ring-2 outline-none
                                    ${formik.touched.fullName && formik.errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                                />
                            </div>
                            {formik.touched.fullName && formik.errors.fullName && <p className='text-red-500 text-xs mt-1'>{formik.errors.fullName}</p>}
                        </div>

                        <div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-green-600" size={18} />
                                <input type="text" placeholder="Mobile Number"
                                    {...formik.getFieldProps('mobile')}
                                    className={`pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50 focus:ring-2 outline-none
                                    ${formik.touched.mobile && formik.errors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                                />
                            </div>
                            {formik.touched.mobile && formik.errors.mobile && <p className='text-red-500 text-xs mt-1'>{formik.errors.mobile}</p>}
                        </div>

                        <div>
                            <div className="relative">
                                <Home className="absolute left-3 top-3 text-green-600" size={18} />
                                <input type="text" placeholder="Full Address"
                                    {...formik.getFieldProps('fullAddress')}
                                    className={`pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50 focus:ring-2 outline-none
                                    ${formik.touched.fullAddress && formik.errors.fullAddress ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                                />
                            </div>
                            {formik.touched.fullAddress && formik.errors.fullAddress && <p className='text-red-500 text-xs mt-1'>{formik.errors.fullAddress}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-3">

                            <div>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 text-green-600" size={18} />
                                    <input type="text" placeholder="city"
                                        {...formik.getFieldProps('city')}
                                        className={`pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50 focus:ring-2 outline-none
                                        ${formik.touched.city && formik.errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                                    />
                                </div>
                                {formik.touched.city && formik.errors.city && <p className='text-red-500 text-xs mt-1'>{formik.errors.city}</p>}
                            </div>

                            <div>
                                <div className="relative">
                                    <Navigation className="absolute left-3 top-3 text-green-600" size={18} />
                                    <input type="text" placeholder="state"
                                        {...formik.getFieldProps('state')}
                                        className={`pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50 focus:ring-2 outline-none
                                        ${formik.touched.state && formik.errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                                    />
                                </div>
                                {formik.touched.state && formik.errors.state && <p className='text-red-500 text-xs mt-1'>{formik.errors.state}</p>}
                            </div>

                            <div>
                                <div className="relative">
                                    <Pin className="absolute left-3 top-3 text-green-600" size={18} />
                                    <input type="text" placeholder="pincode"
                                        {...formik.getFieldProps('pinCode')}
                                        className="pl-10 w-full border border-gray-300 focus:ring-green-500 rounded-lg p-3 text-sm bg-gray-50 focus:ring-2 outline-none"
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="flex gap-2 mt-3">
                            <input type="text" placeholder="search city or area..."
                                className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 
                        focus:ring-green-500 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="bg-green-600 text-white px-5 rounded-lg
                        hover:bg-green-700 transition-all font-medium"
                                onClick={handleSearchQuery}
                            >
                                {searchLoading ? <Loader size={16} className="animate-spin" /> : "Search"}
                            </button>
                        </div>

                        <div className="relative mt-6 h-[330px] rounded-xl overflow-hidden border
                    border-gray-200 shadow-inner">

                            {position && <CheckoutMap position={position} setPosition={setPosition} />}


                            <motion.button
                                whileTap={{ scale: 0.93 }}
                                className="absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full
                            p-3 hover:bg-green-700 transition-all flex items-center justify-center z-999"
                                onClick={handleCurrentLocation}
                            >
                                <LocateFixed size={20} />
                            </motion.button>

                        </div>

                    </div>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all
                duration-300 p-6 border border-gray-100 h-fit"
                >

                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="text-green-600" /> Payment Method
                    </h2>
                    <div className="space-y-4 mb-6">

                        <button
                            onClick={() => setPaymentMethod("online")}
                            className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod === "online"
                                    ? "border-green-600 bg-green-50 shadow-sm"
                                    : "hover:bg-gray-50"
                                }`}>
                            <CreditCardIcon className="text-green-600" />
                            <span className="font-medium text-gray-700">Pay Online (eSewa)</span>
                        </button>

                        <button
                            onClick={() => setPaymentMethod("cod")}
                            className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod === "cod"
                                    ? "border-green-600 bg-green-50 shadow-sm"
                                    : "hover:bg-gray-50"
                                }`}>
                            <Truck className="text-green-600" />
                            <span className="font-medium text-gray-700">Cash on Delivery</span>
                        </button>

                    </div>

                    <div className="border-t pt-4 text-gray-700 space-y-2 text-sm sm:text-base">
                        <div className="flex justify-between">
                            <span className="font-semibold">Subtotal</span>
                            <span className="font-semibold text-green-600">रु{subTotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Delivery Fee</span>
                            <span className="font-semibold text-green-600">रु{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-3">
                            <span>Final Total</span>
                            <span className="font-semibold text-green-600">रु{finalTotal}</span>
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.93 }}
                        className="w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all
                font-semibold "
                        type="button"
                        onClick={() => formik.handleSubmit()}
                    >
                        {esewaLoading
                            ? <Loader size={18} className="animate-spin mx-auto" />
                            : paymentMethod == "cod" ? "Place Order" : "Pay via eSewa"}
                    </motion.button>

                </motion.div>

            </div>

        </div>
    )
}

export default Checkout
