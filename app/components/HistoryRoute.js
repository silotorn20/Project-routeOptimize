"use client";
import { useEffect, useState } from "react";
// css
import styles from '../css/route.module.css';
// modal
import ModalDelete from "../modals/ModalDelete";
import FindingOverlay from '../modals/FindingOverlay'
import showAlert from '../modals/ShowAlert';
// service
import { fetchTrips, deleteTripService } from '../services/tripService';
import { subscribeAuthState } from "../services/authService";

export default function HistoryRouteSidebar({ isOpen, onClose, openComponent, mapRef }) {
  if (!isOpen) return null; // ถ้า Sidebar ไม่เปิด ให้คืนค่า null

  // const [currentPage, setCurrentPage] = useState('History Routes');
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState("");
  const [routes, setRoutes] = useState([]);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeAuthState(setUser, setIdToken); // เรียกใช้ service
    return () => unsubscribe(); // เมื่อ component ถูกลบออก, ยกเลิกการ subscribe
  }, []); // ใช้ [] เพื่อให้เพียงแค่ครั้งแรกที่ mount

  //open modal Delete Student
  const openModalDelete = (id) => {
    setSelectedTripId(id);
    setIsModalDeleteOpen(true);
  };

  const closeModalDelete = () => {
    setIsModalDeleteOpen(false);

  };

  const confirmDelete = async () => {
    try {
      setIsModalDeleteOpen(false);
      await deleteTripService(idToken, selectedTripId);

      showAlert("Deleted success!")
      await fetchTripsAgain();
      closeModalDelete();
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip! Check the console for more details.");
    }

  };

  const fetchTripsAgain = async () => {
    setIsLoadingData(true);
    try {
      if (idToken) {
        const data = await fetchTrips(idToken);
        setRoutes(data);
        console.log("Updated Trips:", data);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setIsLoadingData(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true); // Start loading
      try {
        if (idToken) {
          const data = await fetchTrips(idToken); // Call your service
          setRoutes(data);
          console.log(data);

        }
      } catch (error) {
        console.error("Error fetching marker data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData(); // Call the async function
  }, [idToken]);



  const [isLoading, setIsLoading] = useState();
  const typePage = "history"
  let route_type = '';

  const findingRouteByTripId = async (trips_id, routeType) => {
    console.log("TRIP ID: ", trips_id);
    console.log("TRIP TYPE: ", routeType);
    if (routeType === "Home To School") {
      route_type = 'import-home'
    } else {
      route_type = 'import-bus'
    }



    try {
      setIsLoading(true); // เริ่มโหลด

      if (mapRef.current) {
        const { routes, routeColors, routeDistance, routeDuration, Didu } = await mapRef.current.handleSubmit(
          0,
          0,
          0,
          true,
          "his",
          trips_id
        );
        // openComponent("Route");
        openComponent("Route", { routes, routeColors, routeDistance, routeDuration, Didu, typePage, route_type });
      }

    } catch (error) {
      console.error("Error in findingRoute:", error);
    } finally {
      setIsLoading(false); // สิ้นสุดโหลด
    }
  };

  //////////////////////responsive mobile////////////////////////////////
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [height, setHeight] = useState("40vh");
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
      <div className="h-full px-5 pb-4 overflow-y-auto flex flex-col">
        <h2 className={`${styles.title} sticky top-0 bg-white p-3 mt-[10px]`}>History Routes</h2>
        <button
          type="button"
          className="bg-transparent hover:bg-gray-200  rounded-lg z-20 p-1.5 absolute top-4 end-7 sm:end-7 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={onClose}
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
        <div className='px-4'>
          {routes.map((route, index) => (
            <div key={index} onClick={() => findingRouteByTripId(route.id, route.types)} className={`${styles.card} flex w-full my-1 p-4 max-w-lg flex-col rounded-lg bg-white shadow-sm hover:bg-gray-100`}>
              <div className="mt-1 flex items-center justify-between">
                <h3 className={styles.text_school}>{route.school}</h3>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <h3 className={styles.date}>
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }).format(new Date(route.dataTime))}
                </h3>
                <button
                  className={styles.delete}
                  onClick={(event) => {
                    event.stopPropagation();
                    openModalDelete(route.id);
                  }}
                >
                  Delete
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className={styles.type}>
                  Type:{" "}
                  <span >
                    {route.types}
                  </span>
                </p>
              </div>

            </div>
          ))}
          <ModalDelete isOpen={isModalDeleteOpen}
            onClose={(event) => {
              event.stopPropagation(); // ป้องกันการคลิกปิดแล้วไป trigger การคลิกของ card
              closeModalDelete();
            }}
            type='deleteHistory'
            onConfirm={(event) => {
              event.stopPropagation();
              confirmDelete();
            }}>
          </ModalDelete>
        </div>
      </div>
      {isLoading && <FindingOverlay />}
    </aside>
  );
}