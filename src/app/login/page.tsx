"use client"

import { EyeIcon, EyeOff, Leaf, Loader2, Lock, LogIn, Mail } from 'lucide-react'
import { motion } from "motion/react"
import Image from 'next/image'
import { SubmitEvent, useState } from 'react'
import googleImage from "@/assets/google.png"
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

function LoginContent() {

    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || "/"

    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email").required("Required"),
            password: Yup.string().required("Required")
        }),
        onSubmit: async (values) => {
            setLoading(true)
            setErrorMsg("")
            try {
                const result = await signIn("credentials", {
                    email: values.email,
                    password: values.password,
                    redirect: false,   // we handle redirect manually
                })

                if (result?.error) {

                    setErrorMsg("Invalid email or password. Please try again.")
                    setLoading(false)
                } else {
                    router.push(callbackUrl)
                    router.refresh()
                }
            } catch (error) {
                console.log(error)
                setErrorMsg("Something went wrong. Please try again.")
                setLoading(false)
            }
        }
    })


    return (
        <div className='flex flex-col items-center justify-center min-h-screen px-6 
    py-10 bg-white relative'>

            <motion.h1
                initial={{
                    y: -10,
                    opacity: 0
                }}
                animate={{
                    y: 0,
                    opacity: 1
                }}
                transition={{
                    duration: 0.6
                }}
                className='text-4xl font-extrabold text-green-700 mb-2'
            >
                Welcome Back
            </motion.h1>

            <p className='text-gray-600 mb-8 flex items-center'>
                Login To DailoXpress
                <Leaf className='w-5 h-5 text-green-600' />
            </p>

            <motion.form
                onSubmit={formik.handleSubmit}
                initial={{
                    opacity: 0
                }}
                animate={{
                    opacity: 1
                }}
                transition={{
                    duration: 0.6
                }}
                className='flex flex-col gap-5 w-full max-w-sm'
            >

                <div className='relative'>
                    <Mail className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
                    <input type="email" placeholder="Your Email"
                        {...formik.getFieldProps('email')}
                        className={`w-full border rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 outline-none
                ${formik.touched.email && formik.errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                    />
                    {formik.touched.email && formik.errors.email && <p className='text-red-500 text-xs mt-1'>{formik.errors.email}</p>}
                </div>

                <div className='relative'>
                    <Lock className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
                    <input type={showPassword ? "text" : "password"} placeholder="Your Password"
                        {...formik.getFieldProps('password')}
                        className={`w-full border rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 outline-none
                ${formik.touched.password && formik.errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                    />
                    {
                        showPassword ? <EyeOff className='absolute right-3 top-3.5 w-5 h-5 text-gray-500
                    cursor-pointer' onClick={() => setShowPassword(false)} /> :
                            <EyeIcon className='absolute right-3 top-3.5 w-5 h-5 text-gray-500
                    cursor-pointer' onClick={() => setShowPassword(true)} />
                    }
                    {formik.touched.password && formik.errors.password && <p className='text-red-500 text-xs mt-1'>{formik.errors.password}</p>}
                </div>

                <button type="submit" disabled={loading} className={`w-full font-semibold py-3 rounded-xl transition-all 
                duration-200 shadow-md inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-70 disabled:cursor-not-allowed`}>

                    {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : "Login"}

                </button>

                {/* Error message */}
                {errorMsg && (
                    <div className='w-full bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center'>
                        {errorMsg}
                    </div>
                )}

                <div className='flex items-center gap-2 text-gray-400 text-sm mt-2'>
                    <span className='flex-1 h-px bg-gray-300'></span>
                    OR
                    <span className='flex-1 h-px bg-gray-300'></span>
                </div>

                <button className='w-full flex items-center justify-center gap-3 border border-gray-300
            hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-medium transition-all duration-200'
                    type="button" onClick={() => signIn("google", { callbackUrl })}
                >
                    <Image
                        src={googleImage}
                        width={20}
                        height={20}
                        alt="google"
                    />
                    Continue with Google
                </button>

            </motion.form>

            <p className='cursor-pointer text-gray-600 mt-6 text-sm flex items-center gap-1'
                onClick={() => router.push("/register")}
            >
                Want to create an account ? <LogIn className='w-4 h-4' /> <span className='text-green-600'>Sign Up</span>
            </p>

        </div>
    )
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}