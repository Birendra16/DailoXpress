"use client"

import { getSocket } from "@/lib/socket"
import axios from "axios"
import { Loader, Send, Sparkle } from "lucide-react"
import { AnimatePresence } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

type props = {
    orderId: string,
    deliveryBoyId: string
}

type ChatMessage = {
    _id?: string
    roomId: string
    text: string
    senderId: string
    time: string
}

function DeliveryChat({ orderId, deliveryBoyId }: props) {

    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const chatBoxRef = useRef<HTMLDivElement>(null)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const socket = getSocket()
        socket.emit("join-room", orderId)

        const handleMessage = (message: ChatMessage) => {
            if (message.roomId === orderId) {
                setMessages((prev) => [...(prev || []), message])
            }
        }

        socket.on("send-message", handleMessage)
        return () => {
            socket.emit("leave-room", orderId)
            socket.off("send-message", handleMessage)
        }
    }, [orderId])

    useEffect(() => {
        const getAllMessages = async () => {
            try {
                const result = await axios.post("/api/chat/messages", { roomId: orderId })
                setMessages(result.data as ChatMessage[])
            } catch (error) {
                console.log(error)
            }
        }

        getAllMessages()

    }, [orderId])


    const sendMsg = () => {
        const text = newMessage.trim()
        if (!text) return

        const socket = getSocket()

        const message = {
            roomId: orderId,
            text,
            senderId: deliveryBoyId,
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
        }
        socket.emit("send-message", message)
        setNewMessage("")
    }

    useEffect(() => {
        chatBoxRef.current?.scrollTo({
            top: chatBoxRef.current.scrollHeight,
            behavior: "smooth"
        })
    }, [messages])


    const getSuggestion = async () => {
        setLoading(true)
        try {
            const lastMessage = messages?.filter(m => m.senderId?.toString() !== deliveryBoyId.toString())?.at(-1)
            const result = await axios.post("/api/chat/ai-suggestions", {
                message: lastMessage?.text,
                role: "delivery_boy"
            })

            setSuggestions(result.data)
            setLoading(false)

        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg border p-4 h-108 flex flex-col">


            <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-700 text-sm">Quick Replies</span>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={loading}
                    className="px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700
            rounded-full shadow-sm border border-purple-200"
                    onClick={getSuggestion}
                >
                    <Sparkle size={14} />{loading ? <Loader className="w-4 h-4 animate-spin" /> : "AI suggest"}
                </motion.button>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
                {suggestions.map((s) => (
                    <motion.div
                        key={s}
                        whileTap={{ scale: 0.92 }}
                        className="px-3 py-1 text-xs bg-green-50 border border-green-200 text-green-700
                rounded-full cursor-pointer"
                        onClick={() => setNewMessage(s)}
                    >
                        {s}
                    </motion.div>
                ))}
            </div>


            <div className="flex-1 overflow-y-auto p-2 space-y-3" ref={chatBoxRef}>
                <AnimatePresence>
                    {messages?.map((msg, index) => (
                        <motion.div
                            key={msg._id?.toString() || index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.senderId.toString() == deliveryBoyId ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`px-4 py-2 max-w-[75%] rounded-2xl shadow
                    ${msg.senderId.toString() === deliveryBoyId
                                    ? "bg-green-600 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                                }`}>
                                <p>{msg.text}</p>
                                <p className="text-[10px] opacity-70 mt-1 text-right">{msg.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>


            <div className="flex gap-2 mt-3 border-t pt-3">
                <input type="text" placeholder="Type a message..."
                    className="flex-1 bg-green-100 px-4 py-2 rounded-xl outline-none focus:ring-2
            focus:ring-green-500"
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                />
                <button className="bg-green-600 hover:bg-green-700 p-3 rounded-xl text-white"
                    onClick={sendMsg}
                >
                    <Send size={14} />
                </button>
            </div>
        </div>
    )
}

export default DeliveryChat
