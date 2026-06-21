import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import EditRoleMobile from "@/components/EditRoleMobile";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import connectDB from "@/lib/db";
import Grocery, { IGrocery } from "@/models/grocery.model";
import User from "@/models/user.model";
import { redirect } from "next/navigation";

export default async function Home(props: {
  searchParams: Promise<{
    q: string
  }>
}) {

  const searchParams = await props.searchParams


  await connectDB()
  const session = await auth()
  const user = await User.findById(session?.user?.id)

  const inComplete = user && (!user.mobile || !user.role || (!user.mobile && user.role == "user"))

  if (inComplete) {
    return <EditRoleMobile />
  }

  const plainUser = user ? JSON.parse(JSON.stringify(user)) : null

  let groceryList: IGrocery[] = []
  
  const role = user?.role || "user"

  if (role === "user") {
    if (searchParams.q) {
      groceryList = await Grocery.find({
        $or: [
          { name: { $regex: searchParams?.q || "", $options: "i" } },
          { category: { $regex: searchParams?.q || "", $options: "i" } },
        ]
      })
    } else {
      groceryList = await Grocery.find({})
    }
  }


  return (
    <>
      <Nav user={plainUser} />
      {plainUser && <GeoUpdater userId={plainUser._id} />}
      {
        role == "user" ? (
          <UserDashboard groceryList={groceryList} />
        ) : role == "admin" ? (
          <AdminDashboard />
        ) : <DeliveryBoy />
      }
      <Footer user={plainUser} />
    </>
  );
}
