import { auth } from '@/auth'
import DeliveryBoyDashboard from './DeliveryBoyDashboard'
import connectDB from '@/lib/db'
import Order from '@/models/order.model'

async function DeliveryBoy() {

  const session = await auth()
  await connectDB()
  const deliveryBoyId = session?.user?.id

  const orders = await Order.find({
    assignedDeliveryBoy:deliveryBoyId,
    deliveryOtpVerification:true
  })

  const today = new Date().toDateString()
  const todayOrders = orders.filter((o)=>new Date(o.deliveredAt).toDateString()===today).length
  const todaysEarning = todayOrders*50

  return (
   <>
   <DeliveryBoyDashboard earning={todaysEarning}/>
   </>
  )
}

export default DeliveryBoy