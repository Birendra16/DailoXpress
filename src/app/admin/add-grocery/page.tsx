"use client"

import { ArrowLeft, Loader, PlusCircle, Upload } from 'lucide-react'
import Link from 'next/link'
import { motion } from "motion/react"
import { useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const categories = [
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Rice,Flour & Grains",
    "Snacks & Biscuits",
    "Spices & Masalas",
    "Beverages & Drinks",
    "Personal Care",
    "Household Essentials",
    "Instant & Packaged Food",
    "Baby & Pet Care"
]

const units = [
    "kg", "g", "litre", "ml", "piece", "pack"
]

function AddGrocery() {
    const router = useRouter()
    const [preview, setPreview] = useState<string | null>()
    const [backendImage, setBackendImage] = useState<File | null>()
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length == 0) return
        const file = files[0]
        setBackendImage(file)
        setPreview(URL.createObjectURL(file))
        setErrorMsg("")
    }

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            category: '',
            unit: '',
            price: ''
        },
        validationSchema: Yup.object({
            name: Yup.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").required("Required"),
            description: Yup.string().min(10, "Description must be at least 10 characters").max(500, "Description cannot exceed 500 characters"),
            category: Yup.string().required("Required"),
            unit: Yup.string().required("Required"),
            price: Yup.number().positive("Must be a positive number").required("Required")
        }),
        onSubmit: async (values) => {
            if (!backendImage) {
                setErrorMsg("Image is required")
                return
            }
            setLoading(true)
            setErrorMsg("")
            try {
                const formData = new FormData()
                formData.append("name", values.name)
                formData.append("description", values.description)
                formData.append("category", values.category)
                formData.append("price", values.price)
                formData.append("unit", values.unit)
                formData.append("image", backendImage)

                await axios.post("/api/admin/add-grocery", formData)
                setLoading(false)
                router.push("/admin/view-grocery")
            } catch (error: any) {
                setErrorMsg(error.response?.data?.message || "Something went wrong")
                setLoading(false)
            }
        }
    })

    return (
        <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-green-50
        to-white py-12 px-4 relative'>

            <Link href={"/"}
                className='absolute top-4 left-4 flex items-center gap-2 text-green-700 font-semibold bg-white 
            px-4 py-2 rounded-full shadow-md hover:bg-green-100 hover:shadow-lg transition-all'
            >
                <ArrowLeft className='w-5 h-5' />
                <span className='hidden md:flex'>Back to home</span>
            </Link>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className='bg-white w-full max-w-2xl shadow-2xl rounded-3xl border border-green-100 p-5'
            >
                <div className='flex flex-col items-center mb-3'>

                    <div className='flex items-center gap-3'>
                        <PlusCircle className='text-green-600 w-6 h-6' />
                        <h1>Add Your Grocery</h1>
                    </div>

                    <p className='text-gray-500 text-sm mt-2 text-center'>
                        Fill out the details below to add a new grocery item.
                    </p>

                </div>

                <form className='flex flex-col gap-2 w-full'
                    onSubmit={formik.handleSubmit}
                >

                    <div>
                        <label htmlFor='name' className='block text-sm text-gray-800 font-medium mb-1'>
                            Grocery Name
                            <span className='text-red-500'>*</span>
                        </label>
                        <input type='text' id='name' placeholder='eg: sweets,Milk ...'
                            {...formik.getFieldProps('name')}
                            className={`w-full border rounded-xl px-4 py-1.5 outline-none focus:ring-2 transition-all
                            ${formik.touched.name && formik.errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'}`} />
                        {formik.touched.name && formik.errors.name && <p className='text-red-500 text-xs mt-1'>{formik.errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor='description' className='block text-sm text-gray-800 font-medium mb-1'>
                            Description
                        </label>
                        <textarea id='description' placeholder='About the product...'
                            {...formik.getFieldProps('description')}
                            className={`w-full border rounded-xl px-4 py-1.5 outline-none focus:ring-2 transition-all min-h-[70px]
                            ${formik.touched.description && formik.errors.description ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'}`} />
                        {formik.touched.description && formik.errors.description && <p className='text-red-500 text-xs mt-1'>{formik.errors.description}</p>}
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-sm text-gray-800 font-medium mb-1'>Category<span
                                className='text-red-500'>*</span></label>
                            <select {...formik.getFieldProps('category')}
                                className={`w-full border rounded-xl px-4 py-1.5 outline-none focus:ring-2 transition-all bg-white
                                ${formik.touched.category && formik.errors.category ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'}`}>
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {formik.touched.category && formik.errors.category && <p className='text-red-500 text-xs mt-1'>{formik.errors.category}</p>}
                        </div>

                        <div>
                            <label className='block text-sm text-gray-800 font-medium mb-1'>Unit<span
                                className='text-red-500'>*</span></label>
                            <select {...formik.getFieldProps('unit')}
                                className={`w-full border rounded-xl px-4 py-1.5 outline-none focus:ring-2 transition-all bg-white
                                ${formik.touched.unit && formik.errors.unit ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'}`}>
                                <option value="">Select Unit</option>
                                {units.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {formik.touched.unit && formik.errors.unit && <p className='text-red-500 text-xs mt-1'>{formik.errors.unit}</p>}
                        </div>

                    </div>

                    <div>
                        <label htmlFor='price' className='block text-sm text-gray-800 font-medium mb-1'>
                            Price
                            <span className='text-red-500'>*</span>
                        </label>
                        <input type='text' id='price' placeholder='eg. 130'
                            {...formik.getFieldProps('price')}
                            className={`w-full border rounded-xl px-4 py-1.5 outline-none focus:ring-2 transition-all
                            ${formik.touched.price && formik.errors.price ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'}`} />
                        {formik.touched.price && formik.errors.price && <p className='text-red-500 text-xs mt-1'>{formik.errors.price}</p>}
                    </div>

                    <div className='flex flex-col sm:flex-row items-center gap-5'>
                        <label htmlFor='image' className='cursor-pointer flex items-center justify-center
                        gap-2 bg-green-50 text-sm text-green-800 font-semibold border border-green-200 rounded-xl
                        px-6 py-1.5 hover:bg-green-100 transition-all w-full sm:w-auto'>
                            <Upload className='w-4 h-4' /> Upload image

                        </label>
                        <input type='file' id='image' accept='image/*' hidden
                            onChange={handleImageChange}
                        />

                        {preview &&
                            <Image
                                src={preview}
                                width={100}
                                height={100}
                                alt='image'
                                className='rounded-xl shadow-md border border-gray-200 object-cover'
                            />
                        }
                    </div>
                    {errorMsg && <p className='text-red-500 text-sm text-center font-medium'>{errorMsg}</p>}

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={loading}
                        className='mt-2 w-full bg-linear-to-r from-green-500 to-green-700 text-white text-sm font-semibold
                    py-1.5 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center
                    justify-center gap-2'
                    >
                        {loading ? <Loader className='w-4 h-4 animate-spin' /> : "Add Grocery"}

                    </motion.button>
                </form>

            </motion.div>

        </div>
    )
}

export default AddGrocery