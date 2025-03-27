import styles from '../css/school.module.css'
import MapSelect from "../components/MapSelect";
import { useState, useEffect } from "react";
import { subscribeAuthState } from "../services/authService"; // Service สำหรับ auth state
import { fetchSchool, createSchool, updateSchool } from "../services/schoolService"; // Assuming the fetch function is imported here
import showAlert from '../modals/ShowAlert';

export default function SchoolsPage({ isOpen, onClose, mapRef }) {
    if (!isOpen) return null; // ถ้า Sidebar ไม่เปิด ให้คืนค่า null

    const [isChecked, setIsChecked] = useState(false);

    const [user, setUser] = useState(null);
    const [idToken, setIdToken] = useState(""); // State สำหรับเก็บ token
    const [school, setSchool] = useState({ id: 0, name: "", latitude: "0", longitude: "0" }); // State for the school data, default lat/lng set to 0
    const [isLoadingData, setIsLoadingData] = useState(false); // State for loading status
    const [initialLatitude, setInitialLatitude] = useState("0"); // เก็บค่า latitude เริ่มต้น
    const [initialLongitude, setInitialLongitude] = useState("0"); // เก็บค่า longitude เริ่มต้น
    const [initialName, setInitialName] = useState(""); // เก็บค่า longitude เริ่มต้น
    const [isSaveEnabled, setIsSaveEnabled] = useState(false); // ใช้สำหรับเปิด/ปิดปุ่ม Save

    useEffect(() => {
        const unsubscribe = subscribeAuthState(setUser, setIdToken); // Subscribe to auth state
        return () => unsubscribe(); // เมื่อ component ถูกลบออก, ยกเลิกการ subscribe
    }, []); // ใช้ [] เพื่อให้เพียงแค่ครั้งแรกที่ mount

    useEffect(() => {
        if (idToken) {
            const fetchData = async () => {
                setIsLoadingData(true); // Start loading
                try {
                    const data = await fetchSchool(idToken); // Fetch the school data
                    if (data && data.length > 0) {
                        const schoolData = data[0]; // Assuming only one school data is returned
                        setSchool({
                            id: schoolData.id || 0,
                            name: schoolData.name || "",
                            latitude: schoolData.latitude || "0", // Default to 0 if not available
                            longitude: schoolData.longitude || "0", // Default to 0 if not available
                        });

                        // ตั้งค่า initial latitude และ longitude
                        setInitialName(schoolData.name || "")
                        setInitialLatitude(schoolData.latitude || "0"); // Set initial values to 0 if missing
                        setInitialLongitude(schoolData.longitude || "0"); // Set initial values to 0 if missing
                    } else {
                        // If no data returned, default latitude and longitude to 0
                        setSchool({ id: 0, name: "", latitude: "0", longitude: "0" });
                    }
                } catch (error) {
                    console.error("Error fetching school data:", error);
                } finally {
                    setIsLoadingData(false); // End loading
                }
            };
            fetchData();
        }
    }, [idToken]); // Effect triggers when `idToken` changes

    const funcSchool = async () => {
        if (!idToken) {
            console.error("No idToken found");
            return;
        }

        const dataSchool = {
            name: school.name,
            latitude: school.latitude,
            longitude: school.longitude
        };

        if (school.id === 0) {
            if (school.name !== '' && school.latitude !== '' && school.longitude !== '') {
                try {
                    setIsSaveEnabled(false);
                    await createSchool(idToken, dataSchool);
                    showAlert('Save complete!')
                    // setAlertMessage({
                    //     type: "success",
                    //     message: "School Created Successfully!"
                    // });

                    // // ตั้งเวลาให้ข้อความแจ้งเตือนหายไปหลังจาก 3 วินาที
                    // setTimeout(() => {
                    //     setAlertMessage(null);
                    // }, 3000);

                    fetchData();
                    // mapRef.current?.refetchData();
                    return;
                } catch (error) {
                    console.log(error);
                }
            }
            // setAlertMessage({
            //     type: "warning",
            //     message: "Please fill in all information!"
            // });

            // // ตั้งเวลาให้ข้อความแจ้งเตือนหายไปหลังจาก 3 วินาที
            // setTimeout(() => {
            //     setAlertMessage(null);
            // }, 3000);
            return;
        }

        // const userConfirm = confirm("Press a button!\nEither OK or Cancel.");

        // if (!userConfirm) {
        //     return;
        // }

        setIsSaveEnabled(false);
        if (school.name !== '' && school.latitude !== '' && school.longitude !== '') {
            try {
                await updateSchool(idToken, school.id, school);
                showAlert('Updated Success!')
                // รีเฟรชข้อมูล school ใหม่
                fetchData(); // เรียกใช้ฟังก์ชัน fetchData
                mapRef.current?.refetchData();
                return;
            } catch (error) {
                console.error(error);
            }
        }
        return;
    };

    const fetchData = async () => {
        setIsLoadingData(true); // Start loading
        try {
            const data = await fetchSchool(idToken); // Fetch the school data
            if (data && data.length > 0) {
                const schoolData = data[0]; // Assuming only one school data is returned
                setSchool({
                    id: schoolData.id || 0,
                    name: schoolData.name || "",
                    latitude: schoolData.latitude || "0", // Default to 0 if not available
                    longitude: schoolData.longitude || "0", // Default to 0 if not available
                });

                // ตั้งค่า initial latitude และ longitude
                setInitialName(schoolData.name || "")
                setInitialLatitude(schoolData.latitude || "0"); // Set initial values to 0 if missing
                setInitialLongitude(schoolData.longitude || "0"); // Set initial values to 0 if missing
            } else {
                // If no data returned, default latitude and longitude to 0
                setSchool({ id: 0, name: "", latitude: "0", longitude: "0" });
            }
        } catch (error) {
            console.error("Error fetching school data:", error);
        } finally {
            setIsLoadingData(false); // End loading
        }
    };

    const [isOpenMap, setOpenMap] = useState(false); // ตั้งสถานะเริ่มต้นให้เป็น false (แผนที่ปิด)

    const openMap = () => {
        setOpenMap((prev) => !prev); // เปลี่ยนสถานะจาก open เป็น close หรือจาก close เป็น open
    };

    // Update latitude and longitude based on map click/drag
    const handleLocationChange = (lat, lng) => {
        setSchool((prevSchool) => ({
            ...prevSchool,
            latitude: lat.toFixed(8),
            longitude: lng.toFixed(8),
        }));

        // ตรวจสอบว่า latitude และ longitude มีการเปลี่ยนแปลงจากค่าที่เริ่มต้นหรือไม่
        if (lat.toFixed(8) !== initialLatitude || lng.toFixed(8) !== initialLongitude) {
            setIsSaveEnabled(true); // หากมีการเปลี่ยนแปลง เปิดปุ่ม Save
        } else {
            setIsSaveEnabled(false); // หากไม่มีการเปลี่ยนแปลง ปิดปุ่ม Save
        }
    };

    const handleCancel = () => {
        // รีเซ็ตค่า latitude และ longitude กลับไปเป็นค่าเดิม
        setSchool({
            ...school,
            name: initialName,
            latitude: initialLatitude,
            longitude: initialLongitude,
        });
        setIsSaveEnabled(false); // ปิดปุ่ม Save
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

    return (
        <aside
            id="additional-sidebar"
            className="fixed z-50 w-full sm:w-[500px] h-[500px] sm:h-screen bg-white border-t sm:border-t-0 sm:border-r border-gray-300 bottom-0 sm:top-0 lg:top-0 transition-all ease-in-out"
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
            <div className="h-full px-6 overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between mt-3">
                    <h2 className={styles.title}>School</h2>

                    <button
                        type="button"
                        className="bg-transparent hover:bg-gray-200 rounded-lg z-20 p-1.5 absolute top-3 end-5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
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


                </div>
                <div>

                </div>
                <h1 className={`${styles.text_name} mt-8`}>School name</h1>
                <input
                    type="text"
                    id="school-name"
                    value={school.name}
                    onChange={(e) => { setSchool({ ...school, name: e.target.value }), setIsSaveEnabled(true) }}
                    className={`${styles.input_schoolName} mt-1`}
                />
                <h1 className={`${styles.text_Information} mt-5`}>Information</h1>
                <div className="flex gap-3 mt-3">
                    <div className='w-1/2'>
                        <label>Latitude:</label>
                        <input
                            type='number'
                            id="latitude"
                            min="-90"
                            max="90"
                            value={school.latitude}
                            onChange={(e) => { setSchool({ ...school, latitude: e.target.value }), setIsSaveEnabled(true) }}
                            className={`${styles.input_lat} block`}
                        />
                    </div>
                    <div className='w-1/2'>
                        <label>Longitude:</label>
                        <input
                            type='number'
                            id="longitude"
                            min="-180"
                            max="180"
                            value={school.longitude}
                            onChange={(e) => { setSchool({ ...school, longitude: e.target.value }), setIsSaveEnabled(true) }}
                            className={styles.input_lng}
                        />
                    </div>
                </div>
                <label className="flex items-center cursor-pointer mt-5">
                    {/* Hidden Checkbox */}
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isChecked}
                        onChange={() => setIsChecked(!isChecked)}
                    />

                    {/* Toggle Switch */}
                    <div onClick={openMap} className="relative w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-400 transition">
                        <div className={`absolute mt-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300
                    ${isChecked ? "right-1" : "left-1"}`}
                        ></div>
                    </div>
                    <label className='px-2'>Map</label>
                </label>
                {isOpenMap && (
                    <div className="mt-6 bg-gray-200 w-full h-60">
                        <MapSelect
                            latitude={Math.min(90, Math.max(-90, isNaN(parseFloat(school.latitude)) ? 0 : parseFloat(school.latitude)))} // ตรวจสอบว่าเป็น NaN หรือไม่
                            longitude={Math.min(180, Math.max(-180, isNaN(parseFloat(school.longitude)) ? 0 : parseFloat(school.longitude)))} // ตรวจสอบว่าเป็น NaN หรือไม่
                            onLocationChange={handleLocationChange}
                        />
                    </div>
                )}
                <div className="mt-6 flex">
                    {isSaveEnabled && (
                        <button
                            onClick={handleCancel} // ทำให้ปุ่ม cancel คืนค่าที่เลือกไว้
                            type="button"
                            className={`w-full bg-red-500 hover:bg-red-600 mr-2 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                        >
                            Cancel
                        </button>
                    )}

                    {isSaveEnabled && (
                        <button
                            onClick={funcSchool} // ทำให้ปุ่ม cancel คืนค่าที่เลือกไว้
                            type="button"
                            className={`w-full bg-green-500 hover:bg-green-600 mr-2 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>

        </aside>
    );
}
