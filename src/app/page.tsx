import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import EditRoleMobile from "@/components/EditRoleMobile";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { redirect } from "next/navigation";

export default async function Home() {

  await connectDB()
  const session = await auth()
  const user = await User.findById(session?.user?.id)

  if(!user){
    redirect("/login")
  }

  const inComplete = !user.mobile || !user.role || (!user.mobile && user.role=="user")

  if(inComplete){
    return <EditRoleMobile/>
  }

  const plainUser=JSON.parse(JSON.stringify(user))
  return (
    <>
      <Nav user={plainUser}/>
      <GeoUpdater userId={plainUser._id}/>
      {
        user.role=="user" ? (
          <UserDashboard/>
        ): user.role=="admin"?(
          <AdminDashboard/>
        ):<DeliveryBoy/>
      }
    </>
  );
}
