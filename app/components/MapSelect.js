
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

// ใส่ Token ของคุณที่นี่
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const MapSelect = ({ latitude, longitude, onLocationChange }) => {
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null); // สำหรับการอ้างอิงถึง marker
  const mapRef = useRef(null); // อ้างอิงถึง map

  useEffect(() => {
    // การตั้งค่าแผนที่ครั้งแรก
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/light-v10",
        center: [longitude, latitude], // ตั้งค่าตำแหน่งเริ่มต้น [lng, lat]
        zoom: 5,
        attributionControl: false,
        dragPan: true,
        scrollZoom: true,
        boxZoom: false,
        dragRotate: false,
        maxBounds: [
          [-180, -85],  // Southwest coordinates
          [180, 85],    // Northeast coordinates
        ],
      });

      // ปักหมุดในตำแหน่งเริ่มต้น
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);

      // เมื่อหมุดถูกลาก จะอัปเดตพิกัด
      markerRef.current.on("dragend", () => {
        const { lng, lat } = markerRef.current.getLngLat();
        onLocationChange(lat, lng); // ส่งค่าพิกัดกลับไปยัง parent
      });
    

    // const geocoder = new MapboxGeocoder({
    //   accessToken: mapboxgl.accessToken,
    //   mapboxgl: mapboxgl,
    //   marker: false,
    //   placeholder: "Search location..."
    // })

    // mapRef.current.addControl(geocoder);

    // geocoder.on("result", (event) => {
    //   const { center } = event.result; // ดึงค่า lat, lng
    //   const [lng, lat] = center;

    //   //อัปเดตหมุดไปยังตำแหน่งที่เลือก
    //   markerRef.current.setLngLat([lng, lat]);

    //   //แจ้งให้ parent component รู้ว่าพิกัดเปลี่ยน
    //   onLocationChange(lat, lng);

    //   //ย้ายแผนที่ไปยังตำแหน่งที่เลือก
    //   mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    // });
  } else {
    //เมื่อพิกัดเปลี่ยน แค่ย้ายหมุด ไม่ต้องโหลดแผนที่ใหม่
    if (markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude]);
    }
  }
  
  }, [latitude, longitude]);

  return (
    <div className="w-full h-full" ref={mapContainerRef} />
  );
};

export default MapSelect;

