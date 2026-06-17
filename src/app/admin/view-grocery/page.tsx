"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowLeft, Loader, Package, Pencil, Search, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { IGrocery } from "@/models/grocery.model"
import Image from "next/image"
import { GSSP_NO_RETURNED_VALUE } from "next/dist/lib/constants"

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


function ViewGrocery() {

    const router = useRouter()
    const [groceries, setGroceries] = useState<IGrocery[]>()
    const [editing, setEditing] = useState<IGrocery | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [backendImage, setBackendImage] = useState<Blob | null>(null)
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)


    useEffect(() => {
        const getGroceries = async () => {
            try {
                const result = await axios.get("/api/admin/get-groceries")
                setGroceries(result.data)
            } catch (error) {
                console.log(error)
            }
        }

        getGroceries()
    }, [])

    useEffect(() => {
        if (editing) {
            setImagePreview(editing.image)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }

        return () => {
            document.body.style.overflow = "unset"
        }
    }, [editing])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setBackendImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleEdit = async () => {
        setLoading(true)
        if (!editing) return
        try {
            const formData = new FormData()
            formData.append("groceryId", editing?._id?.toString()!)
            formData.append("name", editing?.name)
            formData.append("category", editing.category)
            formData.append("price", editing.price)
            formData.append("unit", editing.unit)

            if (backendImage) {
                formData.append("image", backendImage)
            }

            const result = await axios.post("/api/admin/edit-grocery", formData)
            setLoading(false)
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
    }

    const handleDelete = async () => {
        setDeleteLoading(true)
        if (!editing) return
        try {
            const result = await axios.post("/api/admin/delete-grocery", { groceryId: editing._id })
            setDeleteLoading(false)
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="pt-4 w-[95%] md:w-[85%] mx-auto pb-20">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 
        text-center sm:text-left"
            >
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 
            text-green-700 font-semibold px-4 py-2 rounded-full transition w-full sm:w-auto"
                >
                    <ArrowLeft size={14} /><span>Back</span>
                </button>
                <h1 className="text-xl md:text-2xl font-extrabold text-green-700 flex
            items-center justify-center gap-2">
                    <Package size={26} />Manage Groceries
                </h1>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm
        mb-8 hover:shadow-lg transition-all max-w-lg mx-auto w-full"
            >
                <Search className="text-gray-500 w-5 h-5 mr-2" />
                <input type="text" className="w-full outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Search by name or category..."
                />
            </motion.form>

            <div className="space-y-3">
                {groceries?.map((g, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 flex
            flex-col sm:flex-row items-center sm:items-start gap-3 p-3 transition-all"
                    >
                        <div className="relative w-full sm:w-28 aspect-square rounded-xl overflow-hidden border
                border-gray-200 shrink-0">
                            <Image
                                src={g.image}
                                alt={g.name}
                                fill
                                sizes="(max-width: 640px) 100vw, 112px"
                                priority={i === 0}
                                className="object-cover hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-between w-full sm:py-1">
                            <div>
                                <h3 className="font-semibold text-gray-800 text-base truncate">{g.name}</h3>
                                <p className="text-gray-500 text-xs capitalize">{g.category}</p>
                            </div>
                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <p className="text-green-700 font-bold text-base">
                                    रु{g.price}/ <span
                                        className="text-gray-500 text-xs font-medium ml-1 "
                                    >{g.unit}</span></p>
                                <button
                                    onClick={() => setEditing(g)}
                                    className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex
                        items-center justify-center gap-1.5 hover:bg-green-700 transition-all w-full sm:w-auto"
                                >
                                    <Pencil size={12} /> Edit
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {editing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50
                backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 relative max-h-[90vh] overflow-y-auto scrollbar-hide"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-xl font-bold text-green-700">Edit Grocery</h2>
                                <button className="text-gray-600 bg-gray-200 p-1.5 hover:bg-gray-300 rounded-lg hover:text-red-700"
                                    onClick={() => setEditing(null)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="relative aspect-square w-40 mx-auto rounded-lg overflow-hidden mb-3
                        border border-gray-200 group">
                                {imagePreview && <Image
                                    src={imagePreview}
                                    alt={editing.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className="object-cover"
                                />}
                                <label htmlFor="imageUpload"
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex
                            items-center justify-center cursor-pointer transition-opacity"
                                ><Upload size={28} className="text-green-800" /></label>
                                <input type="file" accept="image/*" hidden id="imageUpload"
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Enter Grocery Name"
                                    value={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm
                        focus:ring-2 focus:ring-green-500 outline-none"/>

                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2
                        focus:ring-green-500 outline-none bg-white"
                                    value={editing.category}
                                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                >
                                    <option> Select Category</option>
                                    {categories.map((c, i) => (
                                        <option key={i} value={c}>{c}</option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    placeholder="Price"
                                    value={editing.price}
                                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm
                        focus:ring-2 focus:ring-green-500 outline-none"/>

                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2
                        focus:ring-green-500 outline-none bg-white"
                                    value={editing.unit}
                                    onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                                >
                                    <option> Select Unit</option>
                                    {units.map((u, i) => (
                                        <option key={i} value={u}>{u}</option>
                                    ))}
                                </select>

                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white flex items-center text-sm
                        gap-2 hover:bg-green-700 transition-all"
                                    onClick={handleEdit}
                                    disabled={loading}
                                >
                                    {loading ? <Loader size={14} className="animate-spin" /> : "Edit Grocery"}
                                </button>
                                <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white flex items-center text-sm
                        gap-2 hover:bg-red-700 transition"
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? <Loader size={14} className="animate-spin" /> : "Delete Grocery"}
                                </button>
                            </div>

                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default ViewGrocery