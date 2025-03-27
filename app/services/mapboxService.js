import mapboxgl from "mapbox-gl";

import configService from "./configService";

// เก็บ reference ของ markers
let markersList = [];

const resetRoute = (map) => {
  // ลบ layers และ sources ของเส้นทางทั้งหมด
  const layers = map.getStyle().layers; // ดึงข้อมูลเลเยอร์ทั้งหมดในแผนที่
  if (layers) {
    layers.forEach((layer) => {
      if (layer.id.startsWith("route-")) { // ตรวจสอบว่าชื่อเลเยอร์เริ่มต้นด้วย "route-"
        map.removeLayer(layer.id); // ลบเลเยอร์
        map.removeSource(layer.id); // ลบซอร์สที่เกี่ยวข้อง
      }
    });
  }

  // ลบ markers ที่เคยเพิ่มไว้
  markersList.forEach((marker) => marker.remove());
  markersList = []; // รีเซ็ต markersList
};



const drawRoute = async (map, coordinates, routeId, color, isAllRoute) => {

  console.log("************************************************");
  console.log("length coor in mapSer -> " + coordinates.length);
  console.log("************************************************");

  try {
    // ลบ markers เดิมที่มีอยู่ก่อน
    markersList.forEach(marker => marker.remove());
    markersList = []; // รีเซ็ต markersList

    const maxPoints = 25; // จำนวนพิกัดสูงสุดที่ Mapbox รองรับต่อคำขอ
    let totalDistance = 0; // ระยะทางรวม
    let totalDuration = 0; // เวลารวม

    for (let i = 0; i < coordinates.length; i += maxPoints - 1) {
      const chunk = coordinates.slice(i, i + maxPoints);
      // console.log("F' mamSer chunk--> "+ chunk);

      // แปลง coordinates เป็น string ในรูปแบบ "lng,lat;lng,lat;..."
      const coordinateString = chunk
        .map(coord => `${coord[1]},${coord[0]}`)
        .join(";");

      console.log("F' mamSer coordinateString--> " + { i } + " " + coordinateString);

      try {
        // เรียก Directions API สำหรับแต่ละกลุ่ม
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinateString}?geometries=geojson&overview=full&alternatives=true&access_token=${mapboxgl.accessToken}`
        );

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry;
          const distance = data.routes[0].distance; // ระยะทางในเมตร
          const duration = data.routes[0].duration; // เวลาที่ใช้ในการเดินทาง (หน่วยเป็นวินาที)

          totalDistance += distance; // เพิ่มระยะทางรวม
          totalDuration += duration; // เพิ่มเวลารวม


          console.log("----------------------------------------");
          console.log("F' mapSer " + routeId);

          console.log("Total Distance before initialization:", totalDistance);
          console.log("Total Duration before initialization:", totalDuration);
          console.log("----------------------------------------");

          // เพิ่มเส้นทางลงใน Mapbox โดยใช้ routeId เพื่อแยกเส้นทาง
          if (map.getSource(`route-${routeId}-${i}`)) {
            map.getSource(`route-${routeId}-${i}`).setData({
              type: "Feature",
              geometry: route,
            });
          } else {
            map.addSource(`route-${routeId}-${i}`, {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: route,
              },
            });

            map.addLayer({
              id: `route-${routeId}-${i}`,
              type: "line",
              source: `route-${routeId}-${i}`,
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": color,
                "line-width": 4,
              },
            });
          }

          {
            isAllRoute ? null :
              // Start the loop from the second element (index 1)
              coordinates.forEach((coord, index) => {

                // Skip the first position (index 0)
                if (index === 0) return;

                // Create a custom label for all markers except the last one
                const numberLabel = document.createElement("div");
                numberLabel.className = "marker-label";
                numberLabel.style.fontSize = "12px";
                numberLabel.style.color = "black";
                numberLabel.style.backgroundColor = "#ffffff";
                numberLabel.style.borderRadius = "50%";
                numberLabel.style.width = "20px";
                numberLabel.style.height = "20px";
                numberLabel.style.textAlign = "center";
                numberLabel.style.lineHeight = "20px";
                numberLabel.style.fontWeight = "bold";
                numberLabel.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.3)";

                let markerElement;

                // For the last marker, create a red marker
                if (index === coordinates.length - 1) {
                  // Normal marker (default style with red color)
                  markerElement = new mapboxgl.Marker({ color: "red" })
                    .setLngLat([coord[1], coord[0]]) // Set the position
                    .addTo(map);
                } else {
                  // Custom marker with label for other coordinates
                  numberLabel.innerText = index; // Start numbering from 0 (skipping the first marker)
                  markerElement = new mapboxgl.Marker({
                    element: numberLabel,
                  })
                    .setLngLat([coord[1], coord[0]]) // Set the position
                    .addTo(map);
                }

                // Store reference of the marker in markersList
                markersList.push(markerElement);
              });
          }


        } else {
          console.log(`!!!!!No route found for chunk`);
        }
      } catch (error) {
        console.log(`Error processing chunk ${i}:`, error);
      }
    }

    // แปลงระยะทางและเวลาเป็นหน่วยที่เหมาะสม
    const distanceInKm = (totalDistance / 1000).toFixed(2); // แปลงเป็นกิโลเมตร
    const durationInMin = (totalDuration / 60).toFixed(2); // แปลงเป็นนาที

    // console.log("ระยะทางรวม: " + distanceInKm + " กิโลเมตร");
    // console.log("เวลารวม: " + durationInMin + " นาที");

    const cleanRouteId = routeId.replace("route ", ""); // ตัดคำว่า "route " ออก
    const result = {
      id: cleanRouteId,
      distance: distanceInKm, // ระยะทางเป็นกิโลเมตร
      duration: durationInMin, // ระยะเวลาเป็นนาที
    };
    console.log("#########################################");
    console.log("OUT mapSer!!!");
    console.log(result);
    console.log("#########################################");

    return result
  } catch (error) {
    console.error("Error fetching route:", error);
  }
};



// ----------------------------------------------------------------------------------------------------------

const fetchMarkers = async (idToken) => {
  try {
    const response = await fetch(`${configService.baseURL}/api/students`, {
      headers: {
        'Authorization': `Bearer ${idToken}`, // ส่ง token ใน headers
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`Failed to fetch data from API: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching marker data: ", error);
    throw error;
  }
};


const fetchRoutes = async (idToken, map, data) => {
  console.log("Fetching Trips and Drawing Routes... $$$$$");
  console.log();

  try {
    const response = await fetch(`${configService.orToolURL}/solve`, {
      method: 'POST', // ใช้ POST method
      headers: {
        'Content-Type': 'application/json', // Content-Type เป็น JSON
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(data), // ส่ง data ใน body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    // ตรวจสอบว่ามีข้อมูล trips หรือไม่
    if (result && result.trips) {
      // console.log("Trips found:", result.trips);
      return result.trips;
    } else {
      console.warn("No trips found in API response");
      return [];
    }
  } catch (error) {
    console.error("Error fetching trips from API:", error);
    return [];
  }
};


const fetchRouteByTripId = async (idToken, trip_id) => {
  if (!idToken) {
    console.error("ID token is required to fetch trips");
    return [];
  }

  try {
    const response = await fetch(`${configService.baseURL}/api/routes/trip/${trip_id}`, {
      headers: {
        Authorization: `Bearer ${idToken}`, // Send token in headers
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Trips found:", result);
      console.log("Trips found in ser:" + JSON.stringify(result, null, 2));
      return result.trips;
    } else {
      console.error(`Failed to fetch trips: ${response.status} ${response.statusText}`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
};


// ฟังก์ชันสำหรับสุ่มสีแบบ Hex
// function getRandomHexColor() {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++){
//         color += letters[Math.floor(Math.random() *16)];
//     }
//     // console.log("-->"+color);
//     return color; 
// }

function getRandomHexColor() {
  const getRandomValue = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const r = getRandomValue(); // สีแดง
  const g = getRandomValue(); // สีเขียว
  const b = getRandomValue(); // สีน้ำเงิน

  const color = `#${r}${g}${b}`;
  return color;
}

export { drawRoute, getRandomHexColor, fetchMarkers, resetRoute, fetchRoutes, fetchRouteByTripId }

