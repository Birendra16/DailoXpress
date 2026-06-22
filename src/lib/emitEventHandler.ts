import axios from "axios"

async function emitEventHandler(event: string, data: unknown, socketId?: string) {
    const socketServerUrl = process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_SERVER

    if (!socketServerUrl) {
        console.error("SOCKET_SERVER_URL is not configured")
        return
    }

    try {
        await axios.post(`${socketServerUrl}/notify`, { socketId, event, data })
    } catch (error) {
        console.log(error)
    }
}

export default emitEventHandler
