"use client"

import { AppDispatch } from "@/redux/store"
import { setUserData } from "@/redux/slices/userSlice"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useSession } from "next-auth/react"

function useGetMe() {

    const dispatch = useDispatch<AppDispatch>()
    const { status } = useSession()

    useEffect(()=>{
        const getMe = async ()=>{
            if (status !== "authenticated") return
            try{
                const result = await axios.get("/api/me")
                dispatch(setUserData(result.data))
            } catch(error){
                console.log(error)
            }
        }
        getMe()
    },[status, dispatch])
}

export default useGetMe