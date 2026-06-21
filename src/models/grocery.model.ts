import mongoose from "mongoose"

export interface IGrocery {
    _id?: mongoose.Types.ObjectId
    name: string
    price: number
    image: string
    category: string
    unit: string
    description?: string
    reviews?: any[]
    rating?: number
    numReviews?: number
    createdAt?: Date
    updatedAt?: Date
}

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
}, { timestamps: true })

const grocerySchema = new mongoose.Schema<IGrocery>({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
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
        ],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true,
        enum: [
            "kg", "g", "litre", "ml", "piece", "pack"
        ]
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    reviews: [reviewSchema],
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    }

}, { timestamps: true })

const Grocery = mongoose.models.Grocery || mongoose.model("Grocery", grocerySchema)
export default Grocery