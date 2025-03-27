"use client";
import { useState, useEffect, useCallback, useRef } from "react";
// css
import styles from '../css/HomeToSchools.module.css';
import St from '../css/student.module.css';
// modal
import FindingOverlay from '../modals/FindingOverlay'
// service
import { fetchStudents, updateStudentStatus, searchStudents, fetchStudentsByStatus } from '../services/studentService';
import { subscribeAuthState } from "../services/authService";

export default function HomeToSchoolSidebar({ isOpen, openComponent, onClose, mapRef, markersData }) {
    if (!isOpen) return null; // ถ้า Sidebar ไม่เปิด ให้คืนค่า null

    const data = markersData.filter(marker => marker.status === 1)
    const studentMax = data.length

    // const studentAll = markersData.length
    // console.log("student all : "+studentMax);

    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [numVehicles, setNumVehicles] = useState("");
    const [maxStopsPerVehicle, setMaxStopsPerVehicle] = useState("");
    const [maxTravelTime, setMaxTravelTime] = useState(180);

    // const [downloadData, setDownloadData] = useState(false);
    const [user, setUser] = useState(null);
    const [idToken, setIdToken] = useState(""); // State สำหรับเก็บ token
    const typePage = "Home To School"

    useEffect(() => {
        const unsubscribe = subscribeAuthState(setUser, setIdToken); // เรียกใช้ service
        return () => unsubscribe(); // เมื่อ component ถูกลบออก, ยกเลิกการ subscribe
    }, []); // ใช้ [] เพื่อให้เพียงแค่ครั้งแรกที่ mount

    const handleMaxCapacityChange = (e) => {
        const capacity = parseFloat(e.target.value);
        if (isNaN(capacity) || capacity <= 0) {
            setMaxStopsPerVehicle("");
            setNumVehicles("");
            return;
        }
        setMaxStopsPerVehicle(e.target.value); // เก็บเป็น string
        let calculated = Math.ceil(studentMax / capacity);
        if (calculated < 1) {
            calculated = 1;
        }
        setNumVehicles(calculated.toString()); // แปลงเป็น string
    };

    const handleBusChange = (e) => {
        const busVal = parseFloat(e.target.value);
        if (isNaN(busVal) || busVal <= 0) {
            setNumVehicles("");
            setMaxStopsPerVehicle("");
            return;
        }
        setNumVehicles(e.target.value); // เก็บเป็น string

        let calculated = Math.ceil(studentMax / busVal);
        if (calculated < 1) {
            calculated = 1;
        }
        setMaxStopsPerVehicle(calculated.toString()); // แปลงเป็น string
    };


    ////////////////////////////////ดึงข้อมูลนักเรียนทั้งหมด//////////////////////////////////////
    const [searchQuery, setSearchQuery] = useState(""); // State for search input
    const [loading, setLoading] = useState(false); // Loading state for search
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All status');

    const loadStudents = async () => {
        try {
            let data;
            let filterStatus = ''; // Default filter

            // If there's a selected filter for status (Confirmed, Cancelled, etc.)
            if (selectedFilter === 'Confirmed') {
                filterStatus = 'true';
            } else if (selectedFilter === 'Cancelled') {
                filterStatus = 'false';
            }

            // Handle search query
            if (searchQuery.trim()) {
                data = await searchStudents(searchQuery, currentPage);
            } else if (filterStatus) {
                data = await fetchStudentsByStatus(filterStatus, currentPage)
            } else {
                // If neither search query nor filter is applied, fetch all students
                data = await fetchStudents(currentPage);
                console.log('Student all: ', data);
            }

            setStudents(data.students);
            setTotalCount(data.total_count); // Set the total count of students
            setError(null); // Clear any previous error
        } catch (error) {
            setError(error.message);
        }
    };

    // const isFetched = useRef(false);
    useEffect(() => {
        // if (!searchQuery && isFetched.current) return; // ป้องกัน fetch ซ้ำในกรณีที่ไม่ใช่การค้นหา
        // isFetched.current = true; // ทำเครื่องหมายว่ามีการ fetch แล้ว
        loadStudents();
    }, [currentPage, searchQuery, selectedFilter]);


    //////////////////////////////////Search/////////////////////////////////////

    //filter
    const filters = ["All status", "Confirmed", "Cancelled"];

    const handleSearchChange = (e) => {
        console.log("Search Query:", e.target.value);  // ตรวจสอบค่าที่พิมพ์
        setSearchQuery(e.target.value);
    };

    const handleOptionClick = (filter) => {
        setSelectedFilter(filter);
        console.log('Selected option:', filter);
        setIsOpenDropdown(false);
    };

    /////////////ดึงข้อมูลการค้นหา////////////////

    const handleSearch = async (e) => {
        e.preventDefault(); // ป้องกันการรีเฟรชหน้า
        if (!searchQuery.trim()) {
            alert("Please enter a search query.");
            return;
        }

        setLoading(true); // เริ่มสถานะการโหลด
        console.log("Searching for:", searchQuery);

        try {
            data = await searchStudents(searchQuery, currentPage);

            setStudents(data.students); // อัปเดตข้อมูลนักเรียน
            setTotalCount(data.total_count); // จำนวนข้อมูล
            setError(null); // ล้างข้อผิดพลาดเมื่อได้รับข้อมูลสำเร็จ

        } catch (err) {
            setError(err.message); // แสดงข้อผิดพลาด
        } finally {
            setLoading(false); // ปิดสถานะการโหลด
        }
    };
    const studentAll = totalCount;

    const handleNextPage = () => {
        if (currentPage < Math.ceil(totalCount / perPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const totalPages = Math.ceil(totalCount / perPage);

    // const toggleDownload = () => {
    //     setDownloadData(!downloadData);
    // }

    const findingRoute = async () => {
        try {
            setIsLoading(true); // เริ่มโหลด

            if (mapRef.current) {
                const { routes, routeColors, routeDistance, routeDuration, Didu, route_type } = await mapRef.current.handleSubmit(
                    parseInt(numVehicles),
                    parseInt(maxStopsPerVehicle),
                    parseInt(maxTravelTime),
                    true,
                    "home"
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

    const [dateTime, setDateTime] = useState(null);
    useEffect(() => {
        setDateTime(new Date());
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const goMarker = (id) => {
        console.log("goto " + id);
        mapRef.current.goMarkerById(id);
    };

    const updateStatus = useCallback(async (id, currentStatus) => {
        console.log("Updating status for student with ID:", id, "current status:", currentStatus);
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;

            setStudents((prevStudents) =>
                prevStudents.map((student) =>
                    student.id === id ? { ...student, status: newStatus } : student
                )
            );

            await updateStudentStatus(id, newStatus);
            console.log("Student status updated on server");

            mapRef.current?.refetchMark(); // รีเฟทข้อมูลแผนที่ (ถ้าจำเป็น)
        } catch (error) {
            console.error("Error updating student status:", error);
        }
    }, []);

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
        if (!isMobile || ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
        setStartTouch(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (!isMobile || ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

        const touchMove = e.touches[0].clientY;
        setCurrentTouch(touchMove);
        const touchDiff = startTouch - touchMove;

        if (touchDiff > 50) {
            setHeight("40vh"); // ย่อ
        } else if (touchDiff < -50) {
            setHeight("100vh"); // ขยาย
        }
    };

    const handleTouchEnd = (e) => {
        if (!isMobile || ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

        if (currentTouch - startTouch < -50) {
            setHeight("100vh");
        } else if (currentTouch - startTouch > 50) {
            setHeight("40vh");
        }
    };

    const toggleMinimize = () => {
        if (!isMobile) return;

        setHeight("40vh"); // ถ้าเป็น minimized ก็ให้ย่อ ถ้าไม่ก็ให้เต็ม
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
            <div className="h-full overflow-y-auto flex flex-col">
                {/* <h2 className="text-lg font-bold">Home To Schools</h2> */}
                <button
                    type="button"
                    className="bg-transparent hover:bg-gray-200 rounded-lg z-20 p-1.5 absolute top-4 end-3 sm:end-10 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                <div className="h-full overflow-y-auto flex flex-col">
                    <div className="relative px-6 sm:px-8 flex flex-col">
                        <div className='sticky top-0 z-10 bg-white'>
                            <div className="flex flex-col items-start mt-5">
                                {/* <span className={styles.text_date}>Tuesday, January 2025</span> */}
                                <span className={styles.text_date}>
                                    {dateTime ? (
                                        <p>{dateTime.toLocaleString("en-US", { dateStyle: "full" })}</p>
                                    ) : (
                                        <p>Loading...</p>
                                    )}
                                </span>
                            </div>
                            <div className='py-3 sm:py-9'>
                                <label className={styles.text_information}>Information</label>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2 sm:gap-4 py-5">
                                        <div className="flex flex-col">
                                            <label>Number of Bus:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={numVehicles}
                                                // onChange={(e) => setNumVehicles(e.target.value)}
                                                onChange={handleBusChange}
                                                className={`${styles.number_input} mt-2 p-2 `}
                                            />
                                        </div>

                                        <div className="">
                                            <label>Max Capacity:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={maxStopsPerVehicle}
                                                // onChange={(e) => setMaxStopsPerVehicle(e.target.value)}
                                                onChange={handleMaxCapacityChange}
                                                className={`${styles.max_input} mt-2 `}
                                            />
                                        </div>
                                        {/* <div className="flex flex-col">
                                            <label>Max Time (min):</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={maxTravelTime}
                                                onChange={(e) => setMaxTravelTime(e.target.value)}
                                                className={`${styles.time_input} mt-2 `}
                                            />
                                        </div> */}

                                    </div>
                                </div>


                            </div>
                            <div className="mb-2">
                                <span className={styles.text_student}>Address Students ({studentAll})</span>
                            </div>
                            <div className="bg-white border border-gray-300 rounded-md mb-2">
                                <div className="relative flex">
                                    <span className="inset-y-0 start-0 grid w-12 place-content-center">
                                        {/* icon Search */}
                                        <button type="button">
                                            <span className="sr-only">Search</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#707070" className="size-6">
                                                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>

                                    {/* Search input */}
                                    <form onSubmit={handleSearch}>
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className={`${St.input_search} rounded-lg`}
                                        />
                                    </form>

                                    {/* Filter Icon */}
                                    <button
                                        type="button"
                                        className="absolute end-2.5 bottom-2.5 "
                                        onClick={() => setIsOpenDropdown(!isOpenDropdown)
                                        } // Toggle dropdown visibility
                                    >
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#CCCCCC" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                                            </svg>
                                        </div>

                                    </button>

                                    {/* Dropdown Menu */}
                                    {isOpenDropdown && (
                                        <div
                                            className="absolute z-10 right-0 mt-10 rounded-md bg-white shadow-lg focus:outline-none"
                                            role="menu"
                                            aria-orientation="vertical"
                                            aria-labelledby="menu-button"
                                        >
                                            <div className="py-1" role="none">
                                                {filters.map((filter) => (
                                                    <button
                                                        key={filter}
                                                        onClick={() => handleOptionClick(filter)}
                                                        className={`block w-full px-4 py-2 text-left text-sm ${selectedFilter === filter ? "bg-gray-200" : "hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        {filter}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {students.length === 0 ? (
                            <div className="text-center py-4">
                                <span >No results found</span>
                            </div>
                        ) : (
                            students.map((student) => (
                                <div key={student.id} onClick={() => { goMarker(student.id), setTimeout(() => toggleMinimize(), 300); }} className={`${styles.card} flex w-full my-1 p-4 max-w-lg flex-col rounded-lg bg-white shadow-sm border border-slate-200`}>
                                    <div className="flex items-center gap-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="#265CB3" className="size-16">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                        </svg>

                                        <div className="flex w-full flex-col">
                                            <div className="flex items-center justify-between">
                                                <h5 className={styles.text_name}>
                                                    {student.first_name}   {student.last_name}
                                                </h5>
                                            </div>
                                            <p className={styles.text_adress}
                                                onCopy={(e) => {
                                                    e.preventDefault();
                                                    e.clipboardData.setData('text/plain', student.address);
                                                }}>
                                                {student.address.length > 25
                                                    ? student.address.substring(0, 25) + "..."
                                                    : student.address}
                                            </p>

                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(student.id, student.status)}
                                            className={`${student.status === 1 ? styles.btn_status : styles.btn_status_cancel} rounded-lg p-3 py-2 my-2 mb-2`}
                                        >
                                            {student.status === 1 ? 'Confirmed' : 'Cancelled'}
                                        </button>
                                        {/* <button type="button"
                                                className={`${styles.btn_status} rounded-lg p-3 py-2 my-2  mb-2 `}>
                                                Confirmed
                                            </button><button type="button"
                                                className={`${styles.btn_status_cancel} rounded-lg p-3 py-2 my-2  mb-2 `}>
                                                Canceled
                                            </button> */}
                                        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10">
                                                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                                            </svg> */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* <div className="sticky bottom-[70px] bg-white p-1">
                        <div className="w-full flex justify-between py-2 px-5 sm:px-7">
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent default anchor behavior
                                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                                }}
                                className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 ${currentPage > 1 ? 'bg-white  hover:bg-gray-50' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Previous
                            </button>
                            <span className="py-2">
                                Showing {currentPage} to {totalPages}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent default anchor behavior
                                    handleNextPage();
                                }}
                                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${currentPage < Math.ceil(totalCount / perPage)
                                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div> */}

                    {isLoading && <FindingOverlay />}

                    <div className="mt-auto sticky bottom-0 justify-center bg-white  border-gray-300 w-full">
                        <div className="w-full flex justify-between py-3 px-5 sm:px-7">
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent default anchor behavior
                                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                                }}
                                className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 ${currentPage > 1 ? 'bg-white  hover:bg-gray-50' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Previous
                            </button>
                            <span className="py-2">
                                Showing {currentPage} to {totalPages}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent default anchor behavior
                                    handleNextPage();
                                }}
                                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${currentPage < Math.ceil(totalCount / perPage)
                                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                        <div className="bg-white border-t sm:py-5 py-7">
                            <button
                                className={`${styles.btn_route} mx-auto block bg-blue-500 hover:bg-blue-600 rounded px-4 py-2`}
                                onClick={() => {
                                    findingRoute();
                                }}
                            >
                                Optimize Routes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}