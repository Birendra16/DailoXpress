"use client"

import { ArrowLeft, Loader, PlusCircle, Upload } from 'lucide-react'
import Link from 'next/link'
import { motion } from "motion/react"
import { useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'

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
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [unit, setUnit] = useState("")
    const [price, setPrice] = useState("")
    const [preview, setPreview] = useState<string | null>()
    const [backendImage, setBackendImage] = useState<File | null>()
    const [loading, setLoading] = useState(false)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length == 0) return
        const file = files[0]
        setBackendImage(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("description", description)
            formData.append("category", category)
            formData.append("price", price)
            formData.append("unit", unit)

            if (backendImage) {
                formData.append("image", backendImage)
            }

            await axios.post("/api/admin/add-grocery", formData)
            setLoading(false)
            router.push("/admin/view-grocery")
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

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
                    onSubmit={handleSubmit}
                >

                    <div>
                        <label htmlFor='name' className='block text-sm text-gray-800 font-medium mb-1'>
                            Grocery Name
                            <span className='text-red-500'>*</span>
                        </label>
                        <input type='text' id='name' placeholder='eg: sweets,Milk ...'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            className='w-full border
                        border-gray-300 rounded-xl px-4 py-1.5 outline-none focus:ring-2 focus:ring-green-400
                        transition-all'/>

                    </div>

                    <div>
                        <label htmlFor='description' className='block text-sm text-gray-800 font-medium mb-1'>
                            Description
                        </label>
                        <textarea id='description' placeholder='About the product...'
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                            className='w-full border border-gray-300 rounded-xl px-4 py-1.5 outline-none focus:ring-2 focus:ring-green-400 transition-all min-h-[70px]' />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-sm text-gray-800 font-medium mb-1'>Category<span
                                className='text-red-500'>*</span></label>
                            <select name='category'
                                onChange={(e) => setCategory(e.target.value)}
                                value={category}
                                className='w-full border border-gray-300 rounded-xl px-4
                            py-1.5 outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white'>
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm text-gray-800 font-medium mb-1'>Unit<span
                                className='text-red-500'>*</span></label>
                            <select name='unit'
                                onChange={(e) => setUnit(e.target.value)}
                                value={unit}
                                className='w-full border border-gray-300 rounded-xl px-4
                            py-1.5 outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white'>
                                <option value="">Select Unit</option>
                                {units.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                    </div>

                    <div>
                        <label htmlFor='price' className='block text-sm text-gray-800 font-medium mb-1'>
                            Price
                            <span className='text-red-500'>*</span>
                        </label>
                        <input type='text' id='price' placeholder='eg. 130'
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            className='w-full border
                        border-gray-300 rounded-xl px-4 py-1.5 outline-none focus:ring-2 focus:ring-green-400
                        transition-all'/>

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