"use client";
import { useEffect, useState, useRef } from "react";
// css
import styles from '../css/HomeToSchools.module.css';
// service
import { fetchStudentBatchData } from "../services/studentService";
import { subscribeAuthState } from "../services/authService";

export default function DetailRouteSidebar({ route, routeIndex, color, distance, duration, onGoBack, mapRef, route_type, bus_SP }) {
  // console.log("Dis "+distance, "Dura "+duration);

  // console.log("Yoo this is : "+JSON.stringify(bus_SP, null, 2));
  // console.log("Yoo Route is : "+ JSON.stringify(route, null, 2));

  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuthState(setUser, setIdToken);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const allCoordinates = [];
    if (route_type === "home" || route_type === "import-home") {
      if (route && typeof route === "object") {
        Object.entries(route).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // ตัดเอา element ที่ index 0 และ index สุดท้ายออก แล้ววนลูปส่วนที่เหลือ
            value.slice(1, -1).forEach((coordinate) => {
              const [lat, lng] = coordinate;
              allCoordinates.push({ lat, lng });
            });
          }
        });
      }
    } else if (route_type === "import-bus") {
      if (route && typeof route === "object") {
        if (Array.isArray(route.student_bus)) {
          route.student_bus.forEach((coordinate) => {
            const [lat, lng] = coordinate;
            console.log("//////////////////////////" + route.student_bus);

            // เพิ่มข้อมูลลง allCoordinates โดยไม่ต้องตรวจสอบซ้ำ (ถ้าต้องการตรวจสอบก็เพิ่มเงื่อนไขตามที่คุณต้องการ)
            allCoordinates.push({ lat, lng });
          });
        }
      }
    } else {
      if (bus_SP && typeof bus_SP === "object") {
        Object.entries(bus_SP).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((coordinate) => {
              const [lat, lng] = coordinate;
              allCoordinates.push({ lat, lng });
            });
          }
        });
      }
    }

    setCoordinates(allCoordinates);
    console.log("Coordinates this ->>:", allCoordinates);
    console.log("Coordinates length:", allCoordinates.length);
  }, [route, route_type, bus_SP]);


  useEffect(() => {
    const fetchStudentDataForBatch = async () => {
      try {
        const fetchedData = await fetchStudentBatchData(idToken, coordinates);
        setStudentData(fetchedData);
        console.log("Fetched Student Data:", fetchedData);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (coordinates.length > 0 && idToken) {
      fetchStudentDataForBatch();
    }
  }, [coordinates, idToken]);

  const idClick = (id) => {
    console.log("นี่ๆ ID: " + id);
  };

  const goMarker = (id) => {
    mapRef.current.goMarkerById(id);
  };

  //////////////////////responsive mobile////////////////////////////////
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [height, setHeight] = useState("100vh");
  const [startTouch, setStartTouch] = useState(0);
  const [currentTouch, setCurrentTouch] = useState(0);

  // ตรวจสอบขนาดหน้าจอเมื่อโหลดและเมื่อเปลี่ยนขนาด
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ฟังก์ชันสัมผัส (เฉพาะ mobile)
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setStartTouch(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;

    const touchMove = e.touches[0].clientY;
    setCurrentTouch(touchMove);
    const touchDiff = startTouch - touchMove;

    if (touchDiff > 50) {
      setHeight("40vh"); // ย่อ
    } else if (touchDiff < -50) {
      setHeight("100vh"); // ขยาย
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;

    if (currentTouch - startTouch < -50) {
      setHeight("100vh");
    } else if (currentTouch - startTouch > 50) {
      setHeight("40vh");
    }
  };

  const toggleMinimize = () => {
    if (!isMobile) return;

    setHeight("40vh");
  };

  return (
    <aside
      id="additional-sidebar"
      className={`fixed z-50 w-full md:w-[500px] h-[580px] sm:w-[500px] h-[500px] 
          sm:h-screen bg-white border-t sm:border-t-0 sm:border-r border-gray-300 bottom-0 sm:top-0 lg:top-0 transition-all ease-in-out`}
      {...(isMobile
        ? {
          style: { height },
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
        }
        : {})}
    >
      <div className="w-20 h-1 bg-gray-200 rounded mx-auto my-2 cursor-pointer sm:hidden" />
      <div className="h-full flex flex-col px-3 pb-0">

        {/* <button
          type="button"
          className="bg-transparent hover:bg-gray-200  rounded-lg z-20 p-1.5 absolute top-6 end-2 sm:end-7 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={onGoBack}
        >
          <svg
            aria-hidden="false"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
          <span className="sr-only">Close menu</span>
        </button> */}
        {/* Sticky top */}
        <div className="sticky top-0 bg-white">
          <div className="flex items-center justify-between mt-5 mb-2">
            <button
              onClick={onGoBack}
              className="p-2 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>

            </button>
            <div className="flex items-center grow justify-center mr-5">
              <div style={{ width: '40px', height: '40px', backgroundColor: color }}>
              </div>
              <p className="px-2">
                <strong>Route:</strong> {routeIndex.replace("route ", "")}
              </p>

            </div>
          </div>

        </div>
        <hr></hr>
        <div className=" mt-5">


          <div className="flex justify-between">
            <p className="text-black">
              <strong>Distance:</strong> {distance} KM.
            </p>

            <p className="text-black">
              <strong>Duration:</strong> {duration} MIN.
            </p>
          </div>

          {/* <p className="mt-4">
            <strong>Route Info:</strong> {route}
          </p> */}
        </div>

        {loading ? (
          <div className="overflow-y-auto mt-5 mb-5">
            {coordinates.map((coordinate, idx) => (
              <div
                className="cursor-pointer"
                key={idx}
                style={{
                  height: "45px",
                  marginBottom: "10px",
                  borderRadius: "3px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(270deg, #cccccc, #f0f0f0, #cccccc)", // สีที่ชัดเจนขึ้น
                  backgroundSize: "200% 200%",
                  animation: "loadingAnimation 2s ease infinite", // Animation
                }}
              >
                <style>
                  {`
                    @keyframes loadingAnimation {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                  `}
                </style>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-y-auto mt-2 mb-5 ">
            {studentData.map((data, index) => (

              <div
                key={index}
                onClick={() => {
                  goMarker(data.id),
                    toggleMinimize()
                }}

                className={`${styles.card_detail} mt-2 cursor-pointer  hover:bg-gray-100 `}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div className="px-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="#265CB3" className="size-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div className="flex w-full flex-col">
                  <div className="flex items-center justify-between">
                    <h5 className={styles.text_name}>
                      {data.first_name}   {data.last_name}
                    </h5>
                  </div>
                  <p className={styles.text_adress}>
                    {data.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
