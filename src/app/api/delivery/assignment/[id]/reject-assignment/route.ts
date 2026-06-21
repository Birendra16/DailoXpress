import { auth } from "@/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string; }>; }) {
    try {
        await connectDB()

        const { id } = await context.params
        const session = await auth()
        const deliveryBoyId = session?.user?.id

        if (!deliveryBoyId) {
            return NextResponse.json(
                { message: "unauthorize" },
                { status: 400 }
            )
        }

        const assignment = await DeliveryAssignment.findById(id)
        if (!assignment) {
            return NextResponse.json(
                { message: "assignment not found" },
                { status: 400 }
            )
        }

        if (assignment.status !== "broadcasted") {
            return NextResponse.json(
                { message: "assignment no longer available" },
                { status: 400 }
            )
        }

        // Remove the delivery boy from broadcastedTo list so it doesn't show up anymore
        await DeliveryAssignment.updateOne(
            { _id: assignment._id },
            {
                $pull: { broadcastedTo: deliveryBoyId }
            }
        )

        return NextResponse.json(
            { message: "assignment rejected successfully" },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: `reject assignment error ${error}` },
            { status: 500 }
        )
    }
}
