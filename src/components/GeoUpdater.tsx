"use client"

import { getSocket } from "@/lib/socket"
import { useEffect } from "react"

function GeoUpdater({ userId }: { userId: string }) {
    useEffect(() => {
        if (!userId) return

        const socket = getSocket()
        const identify = () => socket.emit("identity", userId)

        identify()
        socket.on("connect", identify)

        return () => {
            socket.off("connect", identify)
        }
    }, [userId])

    useEffect(() => {
        if (!userId) return
        if (!navigator.geolocation) return

        const socket = getSocket()
        const watcher = navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude
            const lon = pos.coords.longitude

            socket.emit("update-location", {
                userId,
                latitude: lat,
                longitude: lon
            })
        }, (err) => {
            console.log(err)
        }, { enableHighAccuracy: true })

        return () => navigator.geolocation.clearWatch(watcher)
    }, [userId])

    return null
}

export default GeoUpdater
