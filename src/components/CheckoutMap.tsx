"use client"

import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import L, { LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"

const markerIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})

type props = {
    position:[number,number],
    setPosition:(pos:[number,number])=>void
}

function CheckoutMap({position,setPosition}:props) {

    if(!position) return null

    const DraggableMarker: React.FC = () => {

        const map = useMap()
        
        useEffect(()=>{
            map.setView(position as LatLngExpression,15,{animate:true})
        },[position,map])

        return <Marker
            icon={markerIcon}
            position={position as LatLngExpression}
            draggable={true}
            eventHandlers={{
                dragend: (e: L.LeafletEvent) => {
                    const marker = e.target as L.Marker
                    const { lat, lng } = marker.getLatLng()
                    setPosition([lat, lng])
                }
            }}
        />
    }

  return (
    <MapContainer center={position as LatLngExpression}
                                    zoom={13} scrollWheelZoom={false}
                                    className="h-full w-full">
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <DraggableMarker/>

                                </MapContainer>
  )
}

export default CheckoutMap