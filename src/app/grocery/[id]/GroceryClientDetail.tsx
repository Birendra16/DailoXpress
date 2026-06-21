"use client"

import { addToCart, decreaseQuantity, increaseQuantity } from '@/redux/slices/cartSlice'
import { AppDispatch, RootState } from '@/redux/store'
import { Minus, Plus, ShoppingCart, Star, MessageSquareWarning } from 'lucide-react'
import { motion } from "motion/react"
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export default function GroceryClientDetail({ item, hasPurchased }: { item: any, hasPurchased: boolean }) {
    const dispatch = useDispatch<AppDispatch>()
    const { cartData } = useSelector((state: RootState) => state.cart)
    const cartItem = cartData.find(i => i._id.toString() == item._id)

    const [isSubmitting, setIsSubmitting] = useState(false)

    const formik = useFormik({
        initialValues: {
            rating: 0,
            comment: ''
        },
        validationSchema: Yup.object({
            rating: Yup.number().min(1, "Please provide a rating").max(5).required("Rating is required"),
            comment: Yup.string().min(5, "Comment must be at least 5 characters").max(500, "Comment cannot exceed 500 characters").required("Comment is required")
        }),
        onSubmit: async (values) => {
            setIsSubmitting(true)
            try {
                await axios.post(`/api/grocery/${item._id}/review`, values)
                window.location.reload()
            } catch (error: any) {
                alert(error.response?.data?.message || "Failed to submit review")
                setIsSubmitting(false)
            }
        }
    })

    return (
        <div className="w-[90%] md:w-[80%] lg:w-[70%] mx-auto pb-24">
            <Link href="/" className="inline-block mb-6 text-green-700 hover:text-green-800 font-medium transition-colors">
                &larr; Back to Home
            </Link>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row mb-12">
                <div className="w-full md:w-1/2 p-8 bg-gray-50 flex items-center justify-center relative">
                    <div className="relative w-full aspect-square">
                        <Image
                            src={item.image}
                            fill
                            alt={item.name}
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-2">{item.category}</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{item.name}</h1>

                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={20} className={star <= (item.rating || 0) ? "fill-yellow-400" : "text-gray-300"} />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">({item.numReviews || 0} reviews)</span>
                    </div>

                    <div className="flex items-end gap-4 mb-8">
                        <span className="text-4xl font-extrabold text-green-700">रु{item.price}</span>
                        <span className="text-lg text-gray-500 mb-1">/ {item.unit}</span>
                    </div>

                    {!cartItem ?
                        <motion.button
                            className='flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white rounded-full py-4 px-8 text-lg font-bold transition-all shadow-md hover:shadow-xl'
                            whileTap={{ scale: 0.96 }}
                            onClick={(e) => {
                                e.preventDefault();
                                dispatch(addToCart({ ...item, quantity: 1 }));
                            }}
                        >
                            <ShoppingCart size={24} /> Add to Cart
                        </motion.button>
                        :
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='flex items-center justify-between bg-green-50 border border-green-200 rounded-full py-3 px-6 gap-4 shadow-sm'
                        >
                            <button
                                className='w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-green-100 transition-all shadow-sm'
                                onClick={(e) => {
                                    e.preventDefault();
                                    dispatch(decreaseQuantity(item._id));
                                }}
                            >
                                <Minus size={24} className='text-green-700' />
                            </button>
                            <span className='text-2xl font-bold text-gray-800 w-12 text-center'>{cartItem.quantity}</span>
                            <button
                                className='w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-green-100 transition-all shadow-sm'
                                onClick={(e) => {
                                    e.preventDefault();
                                    dispatch(increaseQuantity(item._id));
                                }}
                            >
                                <Plus size={24} className='text-green-700' />
                            </button>
                        </motion.div>
                    }
                </div>
            </div>

            {/* About the Product */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-4">About the Product</h2>
                <div className="text-gray-600 leading-relaxed text-lg">
                    {item.description ? (
                        <p>{item.description}</p>
                    ) : (
                        <p className="italic text-gray-400">No description available for this product yet.</p>
                    )}
                </div>
            </div>

            {/* Ratings and Reviews */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Ratings & Reviews</h2>

                {item.reviews && item.reviews.length > 0 ? (
                    <div className="space-y-6 mb-10">
                        {item.reviews.map((review: any, index: number) => (
                            <div key={index} className="border-b border-gray-50 pb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={16} className={star <= review.rating ? "fill-yellow-400" : "text-gray-300"} />
                                        ))}
                                    </div>
                                    <span className="font-semibold text-gray-700">{review.userId?.name || "User"}</span>
                                </div>
                                <p className="text-gray-600">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No reviews yet for this product.</p>
                    </div>
                )}

                {hasPurchased ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mt-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h3>
                        <div className="flex items-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => formik.setFieldValue('rating', star)} className="focus:outline-none" type="button">
                                    <Star size={28} className={star <= formik.values.rating ? "fill-yellow-400 text-yellow-400 cursor-pointer" : "text-gray-300 cursor-pointer"} />
                                </button>
                            ))}
                        </div>
                        {formik.touched.rating && formik.errors.rating && <p className='text-red-500 text-xs mb-4'>{formik.errors.rating}</p>}

                        <textarea
                            className={`w-full border rounded-xl p-4 mt-2 mb-2 outline-none focus:ring-2 focus:ring-green-500 
                            ${formik.touched.comment && formik.errors.comment ? 'border-red-500' : 'border-gray-300'}`}
                            rows={3}
                            placeholder="What do you think about this product?"
                            {...formik.getFieldProps('comment')}
                        />
                        {formik.touched.comment && formik.errors.comment && <p className='text-red-500 text-xs mb-4'>{formik.errors.comment}</p>}

                        <button
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 mt-2 rounded-full transition-all disabled:opacity-50"
                            onClick={() => formik.handleSubmit()}
                            disabled={isSubmitting}
                            type="button"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                ) : (
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 text-center mt-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white p-4 rounded-full shadow-sm">
                                <MessageSquareWarning size={40} className="text-orange-500" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Want to rate this product?</h3>
                        <p className="text-gray-600">
                            You can rate or review this product only after purchasing from DailoXpress.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
