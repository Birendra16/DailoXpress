import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = () => {
    if (!socket) {
        const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER

        if (!socketServerUrl) {
            throw new Error("NEXT_PUBLIC_SOCKET_SERVER is not configured")
        }

        socket = io(socketServerUrl)

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message)
        })
    }

    return socket
}
