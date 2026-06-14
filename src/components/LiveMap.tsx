import L, { LatLngExpression } from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"


interface ILocation {
    latitude: number,
    longitude: number
}

interface IProps {
    userLocation: ILocation,
    deliveryBoyLocation: ILocation
}

function Recenter({positions}:{positions:[number,number]}){
    const map = useMap()

    useEffect(()=>{
        if(positions[0]!==0 && positions[1]!==0){
            map.setView(positions,map.getZoom(),{
                animate:true
            })
        }
    },[positions,map])

    return null
}

function LiveMap({ userLocation, deliveryBoyLocation }: IProps) {

    const deliveryBoyIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png",
        iconSize: [40, 40]
    })

    const userIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
        iconSize: [40, 40]
    })

    const linePositions = 
        deliveryBoyLocation && userLocation
        ? [
            [userLocation.latitude,userLocation.longitude],
            [deliveryBoyLocation.latitude,deliveryBoyLocation.longitude]
        ]:[]
    

    const center =[userLocation.latitude,userLocation.longitude]
    return (
        <div className="w-full h-92 rounded-xl overflow-hidden shadow relative">
            <MapContainer center={center as LatLngExpression}
                zoom={13} scrollWheelZoom={false}
                className="h-full w-full">
                    <Recenter positions={center as any}/>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[userLocation.latitude,userLocation.longitude]} icon={userIcon}>
                    <Popup>delivery Address</Popup>
                </Marker>

                {deliveryBoyLocation && 
                <Marker position={[deliveryBoyLocation.latitude,deliveryBoyLocation.longitude]} 
                icon={deliveryBoyIcon}>
                    <Popup>delivery Boy</Popup>
                    </Marker>}
                    
                <Polyline positions={linePositions as any} color="green"/>

            </MapContainer>
        </div>
    )
}

export default LiveMap