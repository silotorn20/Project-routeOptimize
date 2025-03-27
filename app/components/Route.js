"use client";
import { useState, useEffect, useRef } from "react";
// css
import styles from '../css/HomeToSchools.module.css';
// component
import DetailRouteSidebar from "../components/DetailRoute";
// modal
import ResetModal from "../modals/ResetModal";
import SaveModal from "../modals/SaveModal";
import showAlert from "../modals/ShowAlert";
import DownLoadModal from "../modals/DownloadModal";
// service
import { subscribeAuthState } from "../services/authService"
import { saveTrip } from "../services/tripService";
import { fetchSchool } from "../services/schoolService";

export default function RouteSidebar({ isOpen, openComponent, onClose, mapRef, routes, routeColors, routeDistance, routeDuration, Didu, color, typePage, route_type, bus_SP, student_inBus }) {

  console.log("route by find: ", JSON.stringify(routes, null, 2));
  console.log("type ->", route_type);

  const [activeComponent, setActiveComponent] = useState("list"); // "list" = หน้ารายการ, "detail" = หน้ารายละเอียด
  const [selectedRoute, setSelectedRoute] = useState(null); // เก็บข้อมูลเส้นทางที่เลือก


  if (!isOpen) return null; // ถ้า Sidebar ไม่เปิด ให้คืนค่า null

  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(""); // State สำหรับเก็บ token

  useEffect(() => {
    const unsubscribe = subscribeAuthState(setUser, setIdToken); // เรียกใช้ service
    return () => unsubscribe(); // เมื่อ component ถูกลบออก, ยกเลิกการ subscribe
  }, []); // ใช้ [] เพื่อให้เพียงแค่ครั้งแรกที่ mount

  const [showResetModal, setshowResetModal] = useState(false);

  const onclick = () => {
    setshowResetModal(true);
  }

  const cancel = () => {
    setshowResetModal(false);
  }

  const [showSaveModal, setshowSaveModal] = useState(false);

  const openModal = () => {
    setshowSaveModal(true);
  }

  const CloseModal = () => {
    setshowSaveModal(false);
  }
  // const handleRouteClick = (route, index) => {
  //   setSelectedRoute({ route, index }); // เก็บข้อมูลเส้นทาง
  //   setActiveComponent("detail"); // เปลี่ยนไปหน้ารายละเอียด
  // };

  const goBack = () => {
    mapRef.current.handleReset();
    setActiveComponent("list"); // กลับไปหน้ารายการ
  };


  const resetRoute = () => {
    if (mapRef.current) {
      mapRef.current.handleReset();
      mapRef.current.clearAllElements()
    }
    openComponent();
  };

  const backpage = () => {
    if (mapRef.current) {
      mapRef.current.handleReset();
      mapRef.current.clearAllElements()
    }
    if (typePage === "Home To School") {
      openComponent("HomeToSchools");
    } else if (typePage === "Bus To School") {
      openComponent("ButToSchools");
    } else if (typePage === "history") {
      openComponent("HistoryRoute"); // หรือกำหนดให้ย้อนกลับไปหน้าที่เหมาะสม
    } else {
      openComponent();
    }
  };

  const closePage = () => {
    if (mapRef.current) {
      mapRef.current.handleReset();
      mapRef.current.clearAllElements()
    }
    onClose()
  };

  const drawRoute = async (route, routeKey, routeColor, type) => {
    // console.log(distance, duration);
    mapRef.current.handleReset();
    await mapRef.current.handleDrawRoute(route, routeKey, routeColor, type);  // draw route

    // setSelectedRoute({ route, routeKey, routeColor, distance, duration}); // เก็บข้อมูลเส้นทาง
    // setActiveComponent("detail"); // เปลี่ยนไปหน้ารายละเอียด
  };

  const goDetail = async (route, routeKey, routeColor, type, distance, duration, route_type, bus_sp) => {
    mapRef.current.handleReset();
    await mapRef.current.handleDrawRoute(route, routeKey, routeColor, type);  // draw route

    setSelectedRoute({ route, routeKey, routeColor, distance, duration, route_type, bus_sp }); // เก็บข้อมูลเส้นทาง
    setActiveComponent("detail"); // เปลี่ยนไปหน้ารายละเอียด
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveTrip = async () => {
    if (!idToken) {
      console.error("No idToken found");
      return;
    }

    setIsLoading(true);

    const formattedRoutes = routes.map((route, index) => ({
      [`route ${index + 1}`]: route,
      color: routeColors[index] || "#000000"
    }));

    const data = await fetchSchool(idToken);

    const tripData = {
      school_id: data[0].id,
      types: typePage,
      routes: formattedRoutes
    };

    console.log("JSON Sent to API:", JSON.stringify(tripData, null, 2));

    try {
      const result = await saveTrip(idToken, tripData);

      showAlert("Save complete!")
      console.log("Trip saved successfully:", result);

      if (mapRef.current) {
        mapRef.current.handleReset();
        mapRef.current.clearAllElements()
      }
      openComponent("HistoryRoute");

    } catch (error) {
      console.error("Failed to save trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [showModal, setShowModal] = useState(false);

  // ฟังก์ชันเมื่อกดปุ่ม
  const onButtonClick = () => {
    setShowModal(true); // แสดง Modal เมื่อกดปุ่ม
  };

  const onCloseModal = () => {
    setShowModal(false); // ปิด Modal
  };

  const downloadFile = () => {
    let type = '';
    if (route_type === "import-home") {
      type = 'home'
    } else if (route_type === "import-bus") {
      type = 'bus'
    } else {
      type = route_type;
    }


    const csvHeaders = `route_name,latitude,longitude,color,student_lat,student_lng,${type}\n`;
    const csvRows = [];

    // วนลูป routes และ student_bus เพื่อสร้าง CSV
    routes.forEach((route, routeIndex) => {
      const routeKey = `route ${routeIndex + 1}`;
      const studentBusKey = `student_bus`;

      const color = routeColors[routeIndex] || ""; // ใช้สีของเส้นทาง

      // หาค่าที่ตรงกันของ student_bus
      const studentBus = route[studentBusKey] || [];
      let maxLength = Math.max(route[routeKey].length, studentBus.length);

      // วนลูปเพื่อรวมพิกัดของเส้นทางและนักเรียน
      for (let i = 0; i < maxLength; i++) {
        const coordinate = route[routeKey][i] || ["", ""]; // ใช้ค่าเว้นว่างถ้าไม่มีข้อมูล
        const student = studentBus[i] || ["", ""]; // ใช้ค่าเว้นว่างถ้าไม่มีข้อมูล

        const [latitude, longitude] = coordinate;
        const [student_lat, student_lng] = student;

        csvRows.push(`${routeKey},${latitude},${longitude},${color},${student_lat},${student_lng}`);
      }
    });

    showAlert("Download complete!");
    setShowModal(false); // ปิด Modal

    // รวม header และ rows
    const csvContent = csvHeaders + csvRows.join("\n");

    // บันทึกไฟล์ CSV
    saveCSV(csvContent, `routesData_${type}.csv`);
  };

  const saveCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // สร้าง URL สำหรับดาวน์โหลด
    const url = URL.createObjectURL(blob);

    // สร้าง link สำหรับดาวน์โหลด
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);

    // คลิกเพื่อดาวน์โหลด
    link.click();

    // ทำลาย URL หลังจากการดาวน์โหลดเสร็จ
    URL.revokeObjectURL(url);
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
      setHeight("40vh");
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
      <button
        type="button"
        className="bg-transparent hover:bg-gray-200  rounded-lg z-20 p-1.5 absolute top-6 end-2 sm:end-7 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
        onClick={closePage}
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
      </button>
      <div className="h-full flex flex-col overflow-y-auto px-3 pb-0">

        {/* Sticky top */}
        <div className="sticky top-0">
          <div className="flex items-center justify-center mt-5 mb-2">
            <button
              onClick={backpage}
              className="p-2 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>

            </button>
            <div className="flex items-center grow justify-center mr-5">
              <h1 className={styles.Route}>Routes All</h1>
            </div>
          </div>
        </div>
        <hr></hr>

        <div className="overflow-y-auto">
          <div className="w-full sm:w-full mx-auto p-4">
            <ul className="space-y-3 w-full">
              {/* เพิ่มรายการ All */}
              <li
                key="all"
                className={`${styles.card_route} flex items-center justify-between w-full hover:bg-gray-100 transition-colors `}
                onClick={() => {
                  routes.forEach((route, index) => {
                    drawRoute(routes[index], `route ${index + 1}`, routeColors[index], true);
                    // handleRouteClick(route, index);
                  });
                  toggleMinimize()
                }}

              >

                {/* สีแท็บแสดงสถานะ */}
                <div dir="ltr" className={`w-3 sm:w-5 h-full rounded-s-[5px]`} style={{
                  background: `linear-gradient(${routeColors.join(", ")})`,
                }}></div>

                {/* ข้อมูลเส้นทาง */}
                <div className="flex-1 px-4">
                  <p className={styles.text_routedetail}>
                    <strong>Route:</strong> All
                  </p>
                </div>
              </li>

              {/* mapข้อมูล items */}
              {routes.map((route, index) => {
                const diduArray = JSON.parse(Didu);
                console.log(route[`route ${index + 1}`]);
                return (
                  <li
                    key={index}
                    className={`${styles.card_route} flex items-center justify-between w-full hover:bg-gray-100 transition-colors `}
                  >
                    {/* สีแท็บแสดงสถานะ */}
                    <div
                      className={`w-3 sm:w-5 h-full rounded-s-[5px]`}
                      style={{ backgroundColor: routeColors[index] }}
                    ></div>

                    {/* <div className="flex px-5 items-center">
                      <div style={{ width: '40px', height: '40px', backgroundColor: routeColors[index] }}>
                      </div>
                    </div> */}

                    {/* ข้อมูลเส้นทาง */}
                    <div
                      className="flex-1 px-5"
                      onClick={() => {
                        drawRoute(route, `route ${index + 1}`, routeColors[index], true);
                        toggleMinimize()
                        // handleRouteClick(route, index)
                      }}
                    >
                      <p className={`${styles.text_routedetail} py-1`}>

                        {route_type === "home" || route_type === "import-home" ? (
                          <>
                            Route {index + 1}
                          </>
                        ) : route_type === "bus" || route_type === "import-bus" ? (
                          <>
                            Bus Route {index + 1}
                          </>
                        ) : (
                          <>
                          </>
                        )}
                      </p>
                      <p className={`${styles.text_detail} py-1`}>
                        Distance: {diduArray[index].distance} Km.
                      </p>
                      <p className={`${styles.text_detail} py-1`}>
                        Time: {diduArray[index].duration} Min.
                      </p>
                      <p className={`${styles.text_detail} py-1`}>
                        {route_type === "home" || route_type === "import-home" ? (
                          <>
                            Students: {route[`route ${index + 1}`] ? route[`route ${index + 1}`].length - 2 : 0}
                          </>
                        ) : route_type === "bus" || route_type === "import-bus" ? (
                          <>
                            Students: {route[`student_bus`] ? route[`student_bus`].length : 0}
                          </>
                        ) : (
                          <>
                          </>
                        )}
                      </p>
                    </div>

                    {/* ไอคอนลูกศร */}
                    <div
                      onClick={() => {
                        route_type === "home" ?
                          goDetail(
                            route,
                            `route ${index + 1}`,
                            routeColors[index],
                            false,
                            diduArray[index].distance,
                            diduArray[index].duration,
                            route_type
                          )
                          : route_type === "bus"
                            ? goDetail(
                              route,
                              `route ${index + 1}`,
                              routeColors[index],
                              false,
                              diduArray[index].distance,
                              diduArray[index].duration,
                              route_type,
                              bus_SP[index]
                            )
                            : route_type === "import-home"
                              ? goDetail(
                                route,
                                `route ${index + 1}`,
                                routeColors[index],
                                false,
                                diduArray[index].distance,
                                diduArray[index].duration,
                                route_type
                              )
                              : route_type === "import-bus"
                                ? goDetail(
                                  route,
                                  `route ${index + 1}`,
                                  routeColors[index],
                                  false,
                                  diduArray[index].distance,
                                  diduArray[index].duration,
                                  route_type
                                )
                                : console.warn("Unknown route_type:", route_type)
                        toggleMinimize()
                      }}
                      className="flex items-center mr-2 sm:mr-4 hover:text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {typePage === "Home To School" || typePage === "Bus To School" ? (
          <div className="mt-auto sticky bottom-0 left-0 right-0 bg-white border-t pt-6 sm:pb-[20px] pb-[25px] flex justify-between space-x-3">
            <button
              onClick={() => onclick()}
              className={` ${styles.btn_reset} flex-1 `}
            >
              Reset
            </button>
            <button
              onClick={openModal}
              disabled={isLoading}
              className={` ${styles.btn_save} flex-1 `}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        ) : typePage === "history" ? (
          <div className="mt-auto sticky bottom-0 left-0 right-0 bg-white border-t pt-6 sm:pb-[20px] pb-[25px] flex  justify-center space-x-3">
            <button
              onClick={closePage}
              className={styles.btn_close}
            >
              Close
            </button>
            <button
              onClick={onButtonClick}
              className={styles.btn_download}
            >
              Download
            </button>
          </div>
        ) : (
          <div className="mt-auto sticky bottom-0 left-0 right-0 bg-white border-t pt-6 sm:pb-[20px] pb-[25px] flex justify-between space-x-3">
            <button
              onClick={closePage}
              className="flex-1 text-white bg-red-500 p-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        )}

      </div>

      <ResetModal isOpen={showResetModal} onClose={cancel} resetRoute={resetRoute}></ResetModal>
      <SaveModal isOpen={showSaveModal} onClose={CloseModal} handleSaveTrip={handleSaveTrip}></SaveModal>
      <DownLoadModal isOpen={showModal} onClose={onCloseModal} onDownload={downloadFile}></DownLoadModal>

      {activeComponent === "detail" && selectedRoute && (
        <DetailRouteSidebar
          mapRef={mapRef}
          route={selectedRoute.route}
          routeIndex={selectedRoute.routeKey}
          color={selectedRoute.routeColor}
          distance={selectedRoute.distance}
          duration={selectedRoute.duration}
          route_type={selectedRoute.route_type}
          bus_SP={selectedRoute.bus_sp}
          onGoBack={goBack}
        />
      )}
    </aside>
  );
}
