import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";


import { drawRoute, fetchMarkers, resetRoute, fetchRoutes, fetchRouteByTripId, getRandomHexColor } from "../services/mapboxService";
import { fetchMapCenter } from "../services/schoolService";
import { subscribeAuthState } from "../services/authService";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Map = forwardRef((props, ref) => {

  const { radiusValues } = props; // รับค่าจาก Sidebar

  console.log(">> Radius: " + radiusValues);


  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(""); // State สำหรับเก็บ token


  const [markers, setMarkers] = useState([]); // State สำหรับเก็บข้อมูลหมุดจาก API
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [isLoading, setIsLoading] = useState(false); // สถานะโหลด

  const [depotLat, setDepotLat] = useState();
  const [depotLng, setDepotLng] = useState();



  const refetchData = async () => {
    console.log("map data...");

    try {
      if (idToken) {
        // 🔹 Fetch markers ใหม่
        const data = await fetchMarkers(idToken);
        setMarkers(data);

        // 🔹 Fetch center ของโรงเรียนใหม่
        const mark_center = await fetchMapCenter(idToken);
        setMapCenter(mark_center);
        setDepotLat(mark_center[1]);
        setDepotLng(mark_center[0]);

        // 🔹 รีเซ็ตแผนที่
        if (mapRef.current) {
          const map = initializeMap(mark_center);
          mapRef.current = map;

          // โหลดหมุดใหม่
          if (data.length > 0) {
            addMarkersToMap(map, data);
          }
        }
        console.log("Map data refetched successfully.");
      }
    } catch (error) {
      console.error("Error refetching data:", error);
    }
  };


  // com อื่น ใช้ func ได้
  useImperativeHandle(ref, () => ({
    handleSubmit,
    handleReset,
    handleDrawRoute,
    handleAddCircleClick,
    clearAllElements,
    removeElement,
    updateCircleRadius,
    goMarkerById,
    refetchData,
    handleFindAuto,
    refetchMark
  }));


  const refetchMark = async () => {
    console.log("Updating markers...");
    try {
      if (idToken) {
        // 🔹 Fetch markers ใหม่
        const data = await fetchMarkers(idToken);
        setMarkers(data);
        // if (props.onMarkersUpdate && typeof props.onMarkersUpdate === 'function') {
        //   props.onMarkersUpdate(data);
        // }

  
        // 🔹 อัปเดตหมุดใหม่ที่แผนที่ที่มีอยู่แล้ว
        if (mapRef.current) {
          // เพียงแค่เพิ่มหรืออัปเดตหมุดใหม่โดยไม่ต้องรีโหลดแผนที่
          addMarkersToMap(mapRef.current, data);
        }
        
        console.log("Markers updated successfully.");
      }
    } catch (error) {
      console.error("Error updating markers:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeAuthState(setUser, setIdToken); // เรียกใช้ service
    return () => unsubscribe(); // เมื่อ component ถูกลบออก, ยกเลิกการ subscribe
  }, []); // ใช้ [] เพื่อให้เพียงแค่ครั้งแรกที่ mount



  useEffect(() => {
    const fetchAndSetMarkers = async () => {
      try {
        if (idToken) {
          const data = await fetchMarkers(idToken); // เรียกใช้ service ดึงข้อมูล
          setMarkers(data); // เก็บข้อมูลที่ได้จาก API ใน state    

          // ส่งข้อมูล markers กลับไปยัง Parent Component
          if (props.onMarkersUpdate && typeof props.onMarkersUpdate === 'function') {
            props.onMarkersUpdate(data);
          }

          const mark_center = await fetchMapCenter(idToken);
          setMapCenter(mark_center);
          setDepotLat(mark_center[1]);
          setDepotLng(mark_center[0]);
        }
      } catch (error) {
        console.error("Error fetching marker data: ", error);
      }
    };
    fetchAndSetMarkers();
  }, [idToken]);


  // ฟังก์ชันสำหรับการสร้างแผนที่
  const initializeMap = (mapCenter) => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: mapCenter,
      zoom: 12,
      attributionControl: false,
      dragPan: true,
      scrollZoom: true,
      boxZoom: false,
      dragRotate: false,
    });

    if (mapCenter[0] !== 0 && mapCenter[1] !== 0) {
      new mapboxgl.Marker({ color: "black" }).setLngLat(mapCenter).addTo(map);
    }

    return map;
  };


  const markersRef = useRef({}); // Use useRef to persist markers across renders

  function addMarkersToMap(map, markers) {
    const existingMarkers = document.querySelectorAll('.custom-marker');
    existingMarkers.forEach((marker) => marker.remove());

    markers.forEach(({ id, latitude, longitude, first_name, last_name, age, gender, address, status }) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '8px';
      el.style.height = '8px';
      el.style.backgroundColor = status === 0 ? 'red' : 'rgb(17, 141, 48)';
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([parseFloat(longitude), parseFloat(latitude)])
        .setPopup(
          new mapboxgl.Popup({ closeButton: false })
            .setHTML(
              `<div style="max-width: 250px; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">
            <h1 style="font-size: 15px"><strong>${first_name} ${last_name}</strong></h1>
            <p><strong>Age:</strong> ${age}</p>
            <p><strong>Gender:</strong> ${gender}</p>
            <p><strong>Address:</strong> ${address}</p>
          </div>`
            )
            .setOffset([0, -10]) // Adjust this value to move the popup higher or lower
        )
        .addTo(map);

      markersRef.current[id] = marker; // Use useRef to persist the markers


      el.addEventListener('click', () => {
        map.flyTo({
          center: [parseFloat(longitude), parseFloat(latitude)],
          zoom: 15,
          speed: 1.5,
          curve: 1.5,
          easing(t) {
            return t;
          },
        });
        marker.togglePopup();
      });
    });
  }

  const goMarkerById = (id) => {
    // Access markersRef correctly
    const marker = markersRef.current[id];
    if (marker) {
      // Close any open popups first
      const allPopups = document.querySelectorAll('.mapboxgl-popup'); // Get all popups
      allPopups.forEach(popup => popup.remove()); // Remove all open popups

      // Fly to the marker
      mapRef.current.flyTo({
        center: marker.getLngLat(), // Ensure map is centered at the marker position
        zoom: 15,
        speed: 1.5,
        curve: 1.5,
        easing(t) {
          return t;
        },
      });

      // Show the popup associated with the marker
      marker.getPopup().addTo(mapRef.current); // Directly add the popup to the map
    } else {
      console.warn(`Marker with id ${id} not found.`);
    }
  };


  // ------------------------pin รัศมี--------------------------------------------


  const AddCircleClickRef = useRef(false);
  const [AddCircleClick, setAddCircleClick] = useState(false);

  const [mapElements, setMapElements] = useState([]); // เก็บข้อมูลหมุดและวงกลมทั้งหมด


  // use, stably

  const handleAddCircleClick = () => {
    return new Promise((resolve) => {
      setAddCircleClick((prev) => !prev); // สลับค่าระหว่าง true และ false

      if (mapRef.current) {
        mapRef.current.on('click', async (event) => {
          const { lng, lat } = event.lngLat;
          resolve({ lng, lat }); // ส่งค่าพิกัดกลับหลังจากคลิก
        });
      }
    });
  };


  useEffect(() => {
    AddCircleClickRef.current = AddCircleClick;
  }, [AddCircleClick]);

  const drawCircle = (center, radius, map, circleId) => {
    const points = 64;
    const coordinates = [];
    const distanceX = radius / (111.32 * Math.cos((center[1] * Math.PI) / 180));
    const distanceY = radius / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coordinates.push([center[0] + x, center[1] + y]);
    }
    coordinates.push(coordinates[0]);

    const circleGeoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        },
      ],
    };

    if (map.getSource(circleId)) {
      map.getSource(circleId).setData(circleGeoJSON);
    } else {
      map.addSource(circleId, {
        type: "geojson",
        data: circleGeoJSON,
      });

      map.addLayer({
        id: circleId,
        type: "fill",
        source: circleId,
        layout: {},
        paint: {
          "fill-color": "rgba(0, 190, 248, 0.5)",
          "fill-opacity": 0.5,
        },
      });

      // เส้นขอบของวงกลม
      map.addLayer({
        id: circleId + "-outline",
        type: "line",
        source: circleId,
        layout: {},
        paint: {
          "line-width": 2,  // ปรับความหนาของเส้นขอบ
          "line-color": "#0056b3",  // สีขอบเป็นน้ำเงินเข้ม
          "line-opacity": 1,  // กำหนดความชัดของเส้นขอบ
        },
      });
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6378; // รัศมีโลกเป็นกิโลเมตร
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };


  // ฟังก์ชันเช็คว่านักเรียนอยู่ในวงกลมหรือไม่
  const checkIfStudentInCircle = (studentLat, studentLng, circleLat, circleLng, radius) => {
    const distance = calculateDistance(studentLat, studentLng, circleLat, circleLng);
    return distance <= radius;
  };

  // ฟังก์ชันสำหรับอัปเดตการจัดสรรนักเรียนให้กับหมุดทั้งหมดใหม่
  // โดยให้นักเรียนแต่ละคนอยู่ในหมุดที่ใกล้ที่สุด (เฉพาะหมุดที่วงกลมครอบคลุมนักเรียน)
  const updateStudentAssignments = (circles, markers) => {
    // รีเซ็ตข้อมูลนักเรียนในแต่ละหมุดก่อน
    const newCircles = circles.map(circle => ({ ...circle, students: [] }));

    // วนลูปตรวจสอบนักเรียนแต่ละคน
    markers.forEach(student => {
      let nearestCircle = null;
      let minDistance = Infinity;
      newCircles.forEach(circle => {
        // ตรวจสอบว่านักเรียนอยู่ในวงกลมของหมุดนี้หรือไม่
        if (checkIfStudentInCircle(student.latitude, student.longitude, circle.lat, circle.lng, circle.radius)) {
          const distance = calculateDistance(student.latitude, student.longitude, circle.lat, circle.lng);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCircle = circle;
          }
        }
      });
      // หากพบหมุดที่นักเรียนอยู่ในวงและใกล้ที่สุด ให้นำนักเรียนไปเก็บในหมุดนั้น
      if (nearestCircle) {
        nearestCircle.students.push(student);
      }
    });

    return newCircles;
  };


  // กำหนดตัวแปร global สำหรับนับ marker
  const markerCounterRef = useRef(1);



  const onMapClick = async (event, map, radius) => {
    const { lng, lat } = event.lngLat;
    const circleId = `circle-${lng}-${lat}`;
    // const address = await getName(lng, lat);
    // console.log("//////////"+address);
    
    // สร้าง element สำหรับ marker แบบ custom พร้อมแสดงหมายเลข
    const markerEl = document.createElement("div");
    markerEl.className = "custom-marker";
    markerEl.textContent = markerCounterRef.current; // ใช้ markerCounterRef.current แสดงหมายเลข
    markerCounterRef.current++; // เพิ่มค่าตัวนับ
    // กำหนดสไตล์ให้กับ marker element
    markerEl.style.backgroundColor = "pink";
    markerEl.style.color = "black";
    markerEl.style.borderRadius = "50%";
    markerEl.style.width = "15px";
    markerEl.style.height = "15px";
    markerEl.style.display = "flex";
    markerEl.style.alignItems = "center";
    markerEl.style.justifyContent = "center";
    markerEl.style.fontWeight = "bold";

    // ตั้งค่า data attribute เพื่อเก็บค่า radius ปัจจุบัน
    markerEl.dataset.radius = radius;

    // สร้าง marker ด้วย element ที่กำหนดเองและให้สามารถลากได้
    const marker = new mapboxgl.Marker({ element: markerEl, draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);

    // วาดวงกลมบนแผนที่ด้วยค่า radius ที่ส่งเข้ามา
    drawCircle([lng, lat], radius, map, circleId);

    // สร้างวัตถุใหม่สำหรับหมุด (circle)
    const newCircle = { marker, circleId, map, lng, lat, radius, students: [] };

    // เพิ่มหมุดใหม่ลงใน state แล้วรีคำนวณการจัดสรรนักเรียน
    setMapElements((prev) => {
      const updatedCircles = [...prev, newCircle];
      return updateStudentAssignments(updatedCircles, markers);
    });

    // เมื่อ marker ถูกลาก (dragend)
    marker.on("dragend", () => {
      const newLngLat = marker.getLngLat();
      // อ่านค่า radius ปัจจุบันจาก marker element
      const currentRadius = parseFloat(marker.getElement().dataset.radius);

      // วาดวงกลมใหม่ในตำแหน่งที่ลาก โดยใช้ currentRadius
      drawCircle([newLngLat.lng, newLngLat.lat], currentRadius, map, circleId);

      // อัปเดต state ของหมุดด้วยตำแหน่งใหม่และค่า radius ปัจจุบัน
      setMapElements((prev) => {
        const updatedCircles = prev.map((el) =>
          el.circleId === circleId
            ? { ...el, lng: newLngLat.lng, lat: newLngLat.lat, radius: currentRadius }
            : el
        );
        // รีคำนวณการจัดสรรนักเรียนใหม่ในทุกหมุด
        return updateStudentAssignments(updatedCircles, markers);
      });
    });

    // ปิดการเพิ่มหมุดใหม่ (ถ้าต้องการ)
    setAddCircleClick(false);
  };

  // ----------------------------------------------------------------------------------------

  // ใช้ useEffect เพื่อส่งข้อมูลไปที่ Parent Component เมื่อ mapElements เปลี่ยนแปลง
  useEffect(() => {
    if (typeof props.onMapElementsUpdate === "function") {
      props.onMapElementsUpdate(mapElements);
    }
  }, [mapElements, props.onMapElementsUpdate]); // อัปเดตเมื่อ mapElements เปลี่ยนแปล


  //good
  const updateCircleRadius = (idx, newRadius) => {
    console.log("Updating circle radius for index", idx, "to", newRadius);

    const element = mapElements[idx];
    if (element) {
      const { circleId, map, lng, lat, marker } = element;
      // วาดวงกลมใหม่ด้วยค่า newRadius
      drawCircle([lng, lat], newRadius, map, circleId);
      // อัปเดตค่า data attribute ใน marker ให้เป็น newRadius
      marker.getElement().dataset.radius = newRadius;
      // คำนวณนักเรียนที่อยู่ในวงกลมนี้ โดยใช้ newRadius
      const updatedStudents = markers.filter(student =>
        checkIfStudentInCircle(student.latitude, student.longitude, lat, lng, newRadius)
      );
      // อัปเดต state ของ mapElements
      setMapElements((prev) => {
        // อัปเดตเฉพาะ element ที่ index ตรงกัน
        const updatedCircles = prev.map((el, i) =>
          i === idx ? { ...el, radius: newRadius, students: updatedStudents } : el
        );
        // รีคำนวณการจัดสรรนักเรียนในทุกหมุด
        return updateStudentAssignments(updatedCircles, markers);
      });
    }
  };


  const removeElement = (idx) => {
    const element = mapElements[idx]; // ค้นหา element ตาม index
    if (!element) return;

    const { marker, circleId, map } = element;

    // ลบ marker
    marker.remove();

    // ลบ outline layer (ถ้ามี)
    if (map.getLayer(circleId + "-outline")) {
      map.removeLayer(circleId + "-outline");
    }
    // ลบ fill layer
    if (map.getLayer(circleId)) {
      map.removeLayer(circleId);
    }
    // รอจนกว่า map จะ idle แล้วลบ source
    map.once("idle", () => {
      if (map.getSource(circleId)) {
        map.removeSource(circleId);
      }
    });

    // ลบ element ที่ index ที่เลือกออกจาก state
    const newElements = mapElements.filter((_, i) => i !== idx);

    // อัปเดตการจัดสรรนักเรียนใหม่ในทุกหมุด โดยใช้ฟังก์ชัน updateStudentAssignments
    const updatedCircles = updateStudentAssignments(newElements, markers);

    // อัปเดตหมายเลข marker ใหม่ให้เรียงลำดับตามลำดับใน updatedCircles
    updatedCircles.forEach((el, index) => {
      el.marker.getElement().textContent = index + 1;
    });

    // รีเซ็ต markerCounterRef ให้ตรงกับจำนวน marker ที่เหลือ + 1
    markerCounterRef.current = updatedCircles.length + 1;

    // อัปเดต state mapElements ด้วยข้อมูลใหม่
    setMapElements(updatedCircles);

    // หากมี callback แจ้ง Parent Component ให้ส่งข้อมูลใหม่ไปด้วย
    if (typeof onMapElementsUpdate === "function") {
      props.onMapElementsUpdate(updatedCircles);
    }
  };

  const clearAllElements = () => {
    mapElements.forEach(({ marker, circleId, map }) => {
      // ลบ marker
      marker.remove();

      // ลบ outline layer ก่อน (ถ้ามี)
      if (map.getLayer(circleId + "-outline")) {
        map.removeLayer(circleId + "-outline");
      }
      // ลบ fill layer
      if (map.getLayer(circleId)) {
        map.removeLayer(circleId);
      }
      // ลบ source
      if (map.getSource(circleId)) {
        map.removeSource(circleId);
      }
    });

    // รีเซ็ต marker counter (หรือใช้ useRef ตามที่แนะนำ)
    markerCounterRef.current = 1;

    // อัปเดต state และแจ้ง Parent Component
    setMapElements([]);
    if (typeof onMapElementsUpdate === "function") {
      props.onMapElementsUpdate([]);
    }
  };

  useEffect(() => {
    if (!mapCenter || (mapCenter[0] === 0 && mapCenter[1] === 0)) return;

    const map = initializeMap(mapCenter);
    mapRef.current = map;

    // map.on("click", (event) => {
    //   if (AddCircleClickRef.current) {
    //     onMapClick(event, map, 0.5);
    //   }
    // });

    map.on("click", (event) => {
      if (AddCircleClickRef.current) {
        // ใช้ค่า radius จาก prop radiusValues สำหรับ marker ใหม่
        const currentRadius = (radiusValues && radiusValues.length > 0)
          ? radiusValues[radiusValues.length - 1]
          : 0.5;
        onMapClick(event, map, currentRadius);
      }
    });



    map.on('style.load', () => {
      map.setProjection('globe');
    });



    if (markers.length > 0) {
      addMarkersToMap(map, markers);
    }

    return () => map.remove();
  }, [mapCenter]);

  // MAP END *************************************************************************************************  


  const [routes, setRoutes] = useState([]); // เก็บข้อมูล routes
  const [routeColors, setRouteColors] = useState([]);

  useEffect(() => {
    console.log("Updated routeColors:", routeColors);
  }, [routeColors]);



  const handleSubmit = async (num_bus, max_stops, max_time, type, findBy, trip_id, roteImport) => {
    // const locations = markers.map((marker) => [parseFloat(marker.latitude), parseFloat(marker.longitude) ,marker.status]);
    const locations = markers
      .filter(marker => marker.status === 1) // เลือกเฉพาะ markers ที่มี status เป็น 1
      .map(marker => [parseFloat(marker.latitude), parseFloat(marker.longitude)]);

    // console.log('////////////////////'+markers);
    console.log("Yoo this is : " + JSON.stringify(markers, null, 2));

    const data = {
      depot: [parseFloat(depotLat), parseFloat(depotLng)],
      num_vehicles: num_bus,
      max_stops_per_vehicle: max_stops,
      max_travel_time: max_time * 60, // แปลงเวลาเป็นวินาที
      locations: locations,
    };

    // รีเซ็ตสถานะ
    setRouteColors([]);
    setRoutes([]);
    resetRoute(mapRef.current);

    setIsLoading(true); // เริ่มโหลด


    // console.log("FFFFFFFF  FFF "+JSON.stringify(data, null, 2));


    try {

      let result = []
      let bus_sp = []
      let colors = []
      let route_type

      // เรียก fetchRoutes เพื่อคำนวณเส้นทาง
      if (findBy === "home") {
        result = await fetchRoutes(idToken, mapRef.current, data);
        // setRoutes(result);
        // console.log("route ที่ได้ "+ JSON.stringify(result, null, 2));
        console.log("route ที่ได้ " + result);

        route_type = "home"
        colors = result.map(() => getRandomHexColor());
        // setRouteColors(colors);

      } else if (findBy === "bus") {
        console.log("This: " + max_stops);
        const depot = [parseFloat(depotLat), parseFloat(depotLng)];
        const capacity = max_stops; // เช่น 5 คนต่อคัน
        // กำหนดระยะทาง threshold สำหรับรวมจุด (ปรับตามความเหมาะสม)
        const distanceThreshold = 2.5; // กิโลเมตร

        const filteredMapElements = mapElements.map((stop) => {
          return {
            ...stop,
            students: stop.students.filter((s) => s.status === 1),
          };
        }).filter(stop => stop.students.length > 0);
        // 1. สร้าง pickup units จากแต่ละ bus stop
        // โครงสร้าง: { lat, lng, count, stopId, studentPositions }
        let pickupUnits = [];
        filteredMapElements.forEach((stop) => {
          const count = stop.students.length;
          if (count > capacity) {
            const fullUnits = Math.floor(count / capacity);
            const remainder = count % capacity;
            for (let i = 0; i < fullUnits; i++) {
              pickupUnits.push({
                lat: stop.lat,
                lng: stop.lng,
                count: capacity,
                stopId: stop.circleId || stop.id,
                studentPositions: stop.students
                  .slice(i * capacity, (i + 1) * capacity)
                  .map((s) => [s.latitude, s.longitude]),
              });
            }
            if (remainder > 0) {
              pickupUnits.push({
                lat: stop.lat,
                lng: stop.lng,
                count: remainder,
                stopId: stop.circleId || stop.id,
                studentPositions: stop.students
                  .slice(fullUnits * capacity)
                  .map((s) => [s.latitude, s.longitude]),
              });
            }
          } else {
            pickupUnits.push({
              lat: stop.lat,
              lng: stop.lng,
              count: count,
              stopId: stop.circleId || stop.id,
              studentPositions: stop.students.map((s) => [s.latitude, s.longitude]),
            });
          }
        });
        // ตัวอย่าง: Bus Stop 1 (7 pax) → ได้ unit: {count: 5} และ {count: 2}
        //           Bus Stop 2 (3 pax) → ได้ unit: {count: 3}

        // 2. แยก pickupUnits เป็น fullUnits (ครบ capacity) และ remainderUnits (ไม่ครบ)
        const fullUnits = pickupUnits.filter((unit) => unit.count === capacity);
        let remainderUnits = pickupUnits.filter((unit) => unit.count < capacity);

        // 3. รวม remainderUnits ที่อยู่ใกล้กัน (ใช้ greedy approach)
        const calculateDistance = (lat1, lng1, lat2, lng2) => {
          const R = 6371; // กิโลเมตร
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLng = (lng2 - lng1) * Math.PI / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        let used = new Array(remainderUnits.length).fill(false);
        const combinedGroups = [];
        for (let i = 0; i < remainderUnits.length; i++) {
          if (used[i]) continue;
          let group = [remainderUnits[i]];
          let sum = remainderUnits[i].count;
          let combinedStudentPositions = [...remainderUnits[i].studentPositions];
          used[i] = true;
          for (let j = i + 1; j < remainderUnits.length; j++) {
            if (used[j]) continue;
            const d = calculateDistance(
              remainderUnits[i].lat,
              remainderUnits[i].lng,
              remainderUnits[j].lat,
              remainderUnits[j].lng
            );
            if (d <= distanceThreshold && sum + remainderUnits[j].count <= capacity) {
              group.push(remainderUnits[j]);
              sum += remainderUnits[j].count;
              combinedStudentPositions = combinedStudentPositions.concat(
                remainderUnits[j].studentPositions
              );
              used[j] = true;
              if (sum === capacity) break;
            }
          }
          combinedGroups.push({ group, total: sum, studentPositions: combinedStudentPositions });
        }

        // 4. สร้าง routes (trips) และเก็บตำแหน่งนักเรียน (busStudentPositions)
        let trips = [];
        let busStudentPositions = [];

        // สำหรับ fullUnits: แต่ละ unit สร้าง route แบบ round-trip: depot -> [lat, lng] -> depot
        fullUnits.forEach((unit, index) => {
          const routeName = `route ${trips.length + 1}`;
          const busName = `student_bus`;

          trips.push({
            [routeName]: [
              depot,
              [unit.lat, unit.lng],
              depot
            ],
            [busName]: unit.studentPositions && unit.studentPositions.length > 0
              ? unit.studentPositions.map(pos => [parseFloat(pos[0]), parseFloat(pos[1])])
              : []
          });

          busStudentPositions.push({
            [busName]: unit.studentPositions && unit.studentPositions.length > 0
              ? unit.studentPositions.map(pos => [parseFloat(pos[0]), parseFloat(pos[1])])
              : []
          });
        });

        // สำหรับแต่ละกลุ่มใน combinedGroups: สร้าง route โดยรวมทุก unit ในกลุ่ม
        combinedGroups.forEach((item, index) => {
          const routeName = `route ${trips.length + 1}`;
          const busName = `student_bus`;

          const routeCoordinates = [
            depot,
            ...item.group.map((unit) => [unit.lat, unit.lng]),
            depot
          ];

          trips.push({
            [routeName]: routeCoordinates,
            [busName]: item.studentPositions && item.studentPositions.length > 0
              ? item.studentPositions.map(pos => [parseFloat(pos[0]), parseFloat(pos[1])])
              : []
          });

          busStudentPositions.push({
            [busName]: item.studentPositions && item.studentPositions.length > 0
              ? item.studentPositions.map(pos => [parseFloat(pos[0]), parseFloat(pos[1])])
              : []
          });
        });

        const data = { trips, busStudentPositions };

        result = data.trips;
        bus_sp = data.busStudentPositions;

        // แสดงผลลัพธ์ที่ได้
        console.log("Bus_res: ", JSON.stringify(result, null, 2));
        console.log("Bus_sp: ", JSON.stringify(bus_sp, null, 2));
        

        // route_type = "bus"
        colors = result.map(() => getRandomHexColor());
        
      }
      else if(findBy === "his"){
        result = await fetchRouteByTripId(idToken, trip_id);

        // console.log("HIS "+ JSON.stringify(result.trips, null, 2));

        // colors = result.map(() => getRandomHexColor());
        colors = result.map(route => route.color);
        // console.log("this color"+colors);
        
      }else if(findBy === "import"){
        result = roteImport;

        // console.log("import "+ result);

        colors = result.map(route => route.color);
        // console.log("this color"+colors);
        
      }else {

      }
      

      const distance = [];
      const duration = [];

      // Create an array of Promises
      const drawPromises = result.map(async (route, index) => {
        const routeKey = `route ${index + 1}`;
        const coordinates = route[routeKey];

        console.log("routeKey in MAP :" + routeKey);

        if (coordinates) {
          try {
            const didu = await drawRoute(mapRef.current, coordinates, routeKey, colors[index], type);
            distance.push(didu.distance); // Push distance when resolved
            duration.push(didu.duration); // Push duration when resolved
            return didu;
          } catch (error) {
            console.error("Error drawing route:", error);
          }
        }
        return null;
      });

      // Wait for all Promises to complete
      const diduArray = await Promise.all(drawPromises);

      return { routes: result, routeColors: colors, routeDistance: distance, routeDuration: duration, Didu: JSON.stringify(diduArray, null, 2), route_type: findBy, bus_SP: bus_sp,};

    } catch (error) {
      console.error("Error drawing routes:", error);
      throw error; // ส่งข้อผิดพลาดออกไป
    } finally {
      setIsLoading(false); // สิ้นสุดการโหลด
    }
  };
  //-------------------------------------------------------------------------


  const handleReset = () => {
    setRouteColors([]); // รีเซ็ตสีทั้งหมด
    setRoutes([]); // รีเซ็ตเส้นทางทั้งหมด
    resetRoute(mapRef.current); // ลบเส้นทางบนแผนที่ (ถ้ามีฟังก์ชัน resetRoute)
  };



  // time count
  const [elapsedTime, setElapsedTime] = useState(0); // เก็บเวลาที่ผ่านไป

  useEffect(() => {
    let timer;
    if (isLoading) {
      setElapsedTime(0); // รีเซ็ตเวลาเมื่อเริ่มโหลด
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1); // เพิ่มเวลาทีละ 1 วินาที
      }, 1000);
    } else {
      clearInterval(timer); // หยุดการนับเมื่อโหลดเสร็จ
    }
    return () => clearInterval(timer); // ล้าง timer เมื่อ component ถูก unmount
  }, [isLoading]);



  const handleDrawRoute = async (route, routeKey, routeColor, type) => {
    const coordinates = route[routeKey];
    if (coordinates) {
      const result = await drawRoute(mapRef.current, coordinates, routeKey, routeColor, type); // แสดงลำดับหมุด
      // console.log(".....> "+result);
      return result;
    }
  };





  const findCoverageCircles = (studentPositions_auto, radius) => {
    let centers = [];
    let pin = 0;
    while (studentPositions_auto.length > 0) {
        // หา "จุดที่มีนักเรียนมากที่สุดในรัศมี"
        let bestCenter = null;
        let maxCovered = 0;
  
        for (let i = 0; i < studentPositions_auto.length; i++) {
            const centerCandidate = studentPositions_auto[i];
  
            const covered = studentPositions_auto.filter(pos => 
                calculateDistance(centerCandidate[0], centerCandidate[1], pos[0], pos[1]) <= radius
            );
            if (covered.length > maxCovered) {
                bestCenter = centerCandidate;
                maxCovered = covered.length;
            }
        }

        if (!bestCenter) break;
  
        centers.push(bestCenter);
        // ลบจุดที่ถูกครอบคลุมออกจากรายการ
        studentPositions_auto = studentPositions_auto.filter(pos => 
            calculateDistance(bestCenter[0], bestCenter[1], pos[0], pos[1]) > radius
        );   
    }
    return centers;
  }

  // ฟังก์ชัน handleFindAuto เมื่อกดปุ่ม "Find Auto"
  const handleFindAuto = () => {
    const radius = 1.5;

    // 1. ดึงพิกัดของนักเรียนทั้งหมดจาก markers
    let allStudentPositions = markers
      .filter(student => (student.latitude || student.lat) && (student.longitude || student.lng))
      .map(student => [
        parseFloat(student.latitude || student.lat),
        parseFloat(student.longitude || student.lng)
      ]);

    console.log("Total student positions:", allStudentPositions);

    if (allStudentPositions.length === 0) {
      console.log("No student positions found!");
      return;
    }

    // 2. ใช้ Greedy Algorithm เพื่อหาจุดครอบคลุม
    const centers = findCoverageCircles(allStudentPositions, radius);
    console.log("Calculated auto marker stops:", centers);

    // 3. สร้างวงกลมอัตโนมัติบนแผนที่
    const autoCircles = centers.map((center, idx) => {
      const circleId = `auto-circle-${idx + 1}`;

      // วาดวงกลมที่จุดนี้
      drawCircle([center[1], center[0]], radius, mapRef.current, circleId);

      // สร้าง custom marker
      const markerEl = document.createElement("div");
      markerEl.className = "auto-marker";
      markerEl.textContent = idx + 1;
      Object.assign(markerEl.style, {
        backgroundColor: "red",
        color: "white",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      });

      const newMarker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([center[1], center[0]])
        .addTo(mapRef.current);

      return {
        marker: newMarker,
        circleId,
        map: mapRef.current,
        lng: center[1],
        lat: center[0],
        radius: radius,
        students: []
      };
    });

    // 4. อัปเดตการจัดสรรนักเรียนให้กับ autoCircles
    const updatedAutoCircles = updateStudentAssignments(autoCircles, markers);

    // 5. อัปเดต State และแจ้ง Parent Component
    setMapElements(updatedAutoCircles);
    if (typeof props.onMapElementsUpdate === "function") {
      props.onMapElementsUpdate(updatedAutoCircles);
    }
  };



  // -------------------------------------------------------------------------
  return (
    <div className="h-screen w-full">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full " />
      <p className="absolute bottom-4 right-4 text-gray-600">
        {AddCircleClick ? "Choose a location ... " : " "}
      </p>
      <div className="absolute right-0 bottom-0  bg-red-200">
      </div>
    </div>
  );
});

export default Map;