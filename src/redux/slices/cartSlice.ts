import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IGrocery {
    _id: string,
    name: string,
    price: number,
    image: string,
    category: string,
    unit: string,
    quantity:number,
    createdAt?: Date,
    updatedAt?: Date
}


interface ICartSlice{
    cartData:IGrocery[],
    subTotal:number,
    deliveryFee:number,
    finalTotal: number
}

const initialState:ICartSlice = {
    cartData: [],
    subTotal:0,
    deliveryFee:50,
    finalTotal:50
}

const cartSlice = createSlice({
    name:"cart",
    initialState,
    reducers:{
        addToCart:(state,action:PayloadAction<IGrocery>)=>{
            state.cartData.push(action.payload)
            cartSlice.caseReducers.calculateTotals(state)
        },
        increaseQuantity:(state,action:PayloadAction<string>)=>{
            const item = state.cartData.find(i=>i._id==action.payload)
            if(item){
                item.quantity = item.quantity + 1
            }
            cartSlice.caseReducers.calculateTotals(state)
        },
        decreaseQuantity:(state,action:PayloadAction<string>)=>{
            const item = state.cartData.find(i=>i._id==action.payload)   
            
            if(item?.quantity && item.quantity>1){
                item.quantity = item.quantity - 1
            } else{
                state.cartData = state.cartData.filter(i=>i._id!==action.payload)
            }
            cartSlice.caseReducers.calculateTotals(state)
        },
        removeFromCart:(state,action:PayloadAction<string>)=>{
            state.cartData = state.cartData.filter(i=>i._id!==action.payload)
            cartSlice.caseReducers.calculateTotals(state)
        },
        calculateTotals:(state)=>{
            state.subTotal = state.cartData.reduce((sum, item) => sum + item.price * item.quantity, 0)
            state.deliveryFee = state.subTotal>500?0:50
            state.finalTotal = state.subTotal + state.deliveryFee
        },
        clearCart:(state)=>{
            state.cartData = []
            state.subTotal = 0
            state.deliveryFee = 50
            state.finalTotal = 50
        }   
       
    }
})

export const {addToCart,increaseQuantity,decreaseQuantity,removeFromCart,clearCart} = cartSlice.actions
export default cartSlice.reducer
