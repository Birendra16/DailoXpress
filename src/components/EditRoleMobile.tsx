"use client"

import axios from "axios"
import { ArrowRight, Bike, User, UserCog } from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"

const EditRoleMobile = () => {
    const router = useRouter()

    const [roles, setRoles] = useState([
        { id: "admin", label: "Admin", icon: UserCog },
        { id: "user", label: "User", icon: User },
        { id: "deliveryBoy", label: "Delivery Boy", icon: Bike }
    ])
    const [errorMsg, setErrorMsg] = useState("")

    const { update } = useSession()

    const formik = useFormik({
        initialValues: {
            role: "",
            mobile: ""
        },
        validationSchema: Yup.object({
            role: Yup.string().oneOf(["admin", "user", "deliveryBoy"], "Invalid role").required("Role is required"),
            mobile: Yup.string().length(10, "Must be exactly 10 digits").matches(/^\d+$/, "Numbers only").required("Mobile is required")
        }),
        onSubmit: async (values) => {
            setErrorMsg("")
            try {
                await axios.post("/api/user/edit-role-mobile", {
                    role: values.role,
                    mobile: values.mobile
                })

                await update({ role: values.role })
                router.push("/")
            } catch (error: any) {
                console.log(error)
                setErrorMsg(error.response?.data?.message || "Something went wrong")
            }
        }
    })


    useEffect(() => {

        const checkForAdmin = async () => {
            try {
                const result = await axios.get("/api/check-for-admin")
                if (result.data.adminExist) {
                    setRoles(prev => prev.filter(r => r.id !== "admin"))
                }
            } catch (error) {
                console.log(error)
            }
        }

        checkForAdmin()

    }, [])

    return (
        <div className='flex flex-col items-center min-h-screen p-6 w-full'>

            <motion.h1
                initial={{
                    opacity: 0,
                    y: -20
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                transition={{
                    duration: 0.6
                }}
                className='text-3xl md:text-4xl font-extrabold text-green-700 text-center mt-8'
            >
                Select Your Role
            </motion.h1>

            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10">
                {roles.map((role) => {
                    const Icon = role.icon
                    const isSelected = formik.values.role == role.id
                    return (
                        <motion.div
                            key={role.id}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => formik.setFieldValue('role', role.id)}
                            className={`flex flex-col items-center justify-center w-48 h-44  rounded-2xl border-2 transition-all cursor-pointer
                    ${isSelected
                                    ? "border-green-600 bg-green-100 shadow-lg"
                                    : "border-gray-300 bg-white hover:border-green-400"

                                }`}
                        >
                            <Icon />
                            <span>{role.label}</span>
                        </motion.div>
                    )
                })}
            </div>

            <motion.div
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1
                }}
                transition={{
                    duration: 0.6,
                    delay: 0.5
                }}
                className="flex flex-col items-center mt-10"
            >
                <label htmlFor="mobile" className="text-gray-700 font-medium mb-2">Enter Your Mobile Number</label>
                <input type="tel"
                    id="mobile"
                    {...formik.getFieldProps('mobile')}
                    className={`w-64 md:w-80 px-4 py-3 rounded-xl border focus:ring-2 outline-none text-gray-800
                    ${formik.touched.mobile && formik.errors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                    placeholder="eg. 98XXXXXXXX"
                />
                {formik.touched.mobile && formik.errors.mobile && <p className='text-red-500 text-xs mt-1'>{formik.errors.mobile}</p>}
                {formik.touched.role && formik.errors.role && !formik.values.role && <p className='text-red-500 text-xs mt-1'>{formik.errors.role}</p>}
                {errorMsg && <p className='text-red-500 text-xs mt-2'>{errorMsg}</p>}
            </motion.div>

            <motion.button
                initial={{
                    opacity: 0,
                    y: 20
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                transition={{
                    delay: 0.7
                }}
                type="button"
                className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-2xl shadow-md transition-all
            duration-200 w-48 mt-16 bg-green-600 hover:bg-green-700 text-white`}
                onClick={() => formik.handleSubmit()}
            >
                Go to Home
                <ArrowRight />
            </motion.button>

        </div>
    )
}

export default EditRoleMobile