"use client"

import { IndianRupee, Package, Truck, Users } from "lucide-react"
import {motion} from "motion/react"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts"

type propType = {
    earning:{
        today:number,
        sevenDays:number,
        total:number
    },
    stats: {
    title: string,
    value: number
    }[],
    chartData: {
    day: string;
    orders: number;
}[]
}

function AdminDashboardClient({earning,stats,chartData}:propType) {

    const [filter,setFilter]= useState<"today" | "sevenDays" | "total">()

    const currentEarning = filter==="today"?earning.today
    :filter==="sevenDays"?earning.sevenDays
    :earning.total

    const title = filter==="today"?"Today's Earning"
    :filter==="sevenDays"?"Last 7 Days Earning"
    :"Total Earning"

  return (
    <div className="pt-22 w-[90%] md:w-[80%] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4
        text-center sm:text-left">
            <motion.h1
            initial={{opacity:0,y:20}}
            animate={{opacity:1,y:0}}
            transition={{duration:0.5}}
            className="text-lg md:text-xl font-bold text-green-700"
            >
              🏪 Admin Dashboard
            </motion.h1>

            <select className="border border-gray-300 rounded-lg px-4 py-1 text-sm focus:ring-2
            focus:ring-green-500 outline-none transition w-full sm:w-auto"
            onChange={(e)=>setFilter(e.target.value as any)}
            value={filter}
            >
                <option value="total">Total</option>
                <option value="sevenDays">Last 7 Days</option>
                <option value="today">Today</option> 
            </select>
        </div>

        <motion.div
        initial={{opacity:0,y:15}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.3}}
        className="bg-green-50 border border-green-200 shadow-sm rounded-2xl p-1.5 text-center mb-4"
        >
            <h2 className="text-sm font-semibold text-green-700 mb-1">{title}</h2>
            <p className="text-xl font-extrabold text-green-800">रु{currentEarning.toLocaleString()}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {stats.map((s,i)=>{

                const icons = [
                    <Package key="p" className="text-green-700 w-4 h-4" />,
                    <Users key="u" className="text-green-700 w-4 h-4" />,
                    <Truck key="t" className="text-green-700 w-4 h-4" />,
                    <IndianRupee key="r" className="text-green-700 w-4 h-4" />,
                ]

                return(
                    <motion.div
                    key={i}
                    initial={{opacity:0,y:20}}
                    animate={{opacity:1,y:0}}
                    transition={{delay:i*0.1}}
                    className="bg-white border border-gray-100 shadow-md rounded-2xl p-3 flex items-center
                    gap-4 hover:shadow-lg transition-all"
                    >
                        <div className="bg-green-100 p-2 rounded-xl">
                            {icons[i]}
                        </div>
                        <div>
                        <p className="text-gray-700 text-xs">{s.title}</p>
                        <p className="text-xl font-bold text-gray-800">{s.value}</p>
                        </div>
                    </motion.div>
                )
            })}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">📈 Orders Overview (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                 <XAxis dataKey="day" />
                  <Tooltip/>
                  <Bar  dataKey="orders" fill="#16A34A" radius={[6,6,0,0]}/>
                </BarChart>
            </ResponsiveContainer>
        </div>

    </div>
  )
}

export default AdminDashboardClient