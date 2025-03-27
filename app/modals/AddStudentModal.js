"use client";
import Link from 'next/link';
import { useState } from "react";
// css
import style from '../css/side.module.css';
// component
import MapSelect from "../components/MapSelect";
// modal
import showAlert from './ShowAlert';
// service
import { createBatchStudents } from '../services/studentService';
import { getName } from "../services/GeocodingService";

const addStudent = ({ isOpenAddStudent, onCloseAddStudent, onAddStudent, mapRef }) => {
    if (!isOpenAddStudent) return null;

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        age: "",
        gender: "",
        address: "",
        latitude: "",
        longitude: "",
        status: "",
    });

    const [addresses, setAddresses] = useState("");

    // ฟังก์ชันที่ใช้เมื่อหมุดถูกเลื่อน
    const handleLocationChange = async(lat, lng) => {
        console.log("Updated Location:", lat, lng);

        try {
            const address = await getName(lng, lat); // ✅ Wait for the API response
            console.log("Fetched Address:", address);
    
            setAddresses(address); // ✅ Store the resolved address in state
    
            setFormData((prevFormData) => ({
                ...prevFormData,
                latitude: lat.toFixed(8),  // ✅ Store latitude
                longitude: lng.toFixed(8), // ✅ Store longitude
            }));
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddresses("Unknown location"); // ✅ Fallback value
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    //insert data student
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log(formData.latitude + '/' + formData.longitude);
            console.log(parseFloat(formData.latitude).toFixed(8) + '//' + parseFloat(formData.longitude).toFixed(8));

            // Prepare student data
            const studentData = [{
                first_name: formData.first_name,
                last_name: formData.last_name,
                age: formData.age,
                gender: formData.gender,
                address: addresses,
                latitude: formData.latitude ? parseFloat(formData.latitude).toFixed(8) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude).toFixed(8) : null,
                status: 1,
            }];

            // Call the service function
            const data = await createBatchStudents(studentData);

            console.log("API Response:", data);

            // Handle success
            onAddStudent(data);
            showAlert("Import success!");
            mapRef.current?.refetchMark();
            onCloseAddStudent();
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div
            className={`${isOpenAddStudent ? "fixed" : "hidden"
                } overflow-y-auto overflow-x-hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-50  h-full w-full flex items-center justify-center`}
        >
            <div className="bg-white rounded-lg shadow-xl p-6 md:w-[536px] md:h-[1127px] sm:w-[990px] sm:h-[777px] lg:w-[990px] lg:h-[777px] relative z-50 max-h-[90vh] overflow-y-auto">
                <div className=" sm:rounded-lg  flex flex-col justify-center py-5 p-5">
                    {/* <div className="flex min-h-full flex-1 flex-col justify-center px-4 py-8 lg:py-12"> */}
                    <Link href="" onClick={onCloseAddStudent} className={style.link}>
                        <div className='flex'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 pb-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            <div className='ml-1'>
                                Back to Student
                            </div>
                        </div>
                    </Link>
                    <div className="py-8">
                        <h2 className={style.title}>
                            Add New Student
                        </h2>
                        <div className={style.p}>
                            Fill out the form below to add a new student to the system.
                        </div>
                    </div>


                    {/* <div className="grid grid-flow-col grid-rows-3 gap-4"> */}
                    <form onSubmit={handleSubmit} className='mt-3'>
                        <div className='grid lg:grid-cols-2 gap-4 sm:grid-cols-1'>
                            <div className='flex flex-col justify-center'>

                                {/* <div className={`${style.text_email}`}>
                                    <label htmlFor="StudentID">
                                        Student ID
                                    </label>
                                    <div className={style.input_placeholder_email}>
                                        <input
                                            type="text"
                                            id="StudentID"
                                            name="student_id"
                                            maxLength="6"  // จำกัดจำนวนตัวอักษรเป็น 6 ตัว
                                            onChange={handleInputChange}
                                            className={style.input_email}
                                            required
                                            placeholder="Enter 6-digit student ID" // ข้อความบอกใน input
                                        />
                                    </div>
                                </div> */}

                                <div className='grid grid-cols-2 gap-4 '>

                                    <div className={`${style.text_email}`}>
                                        <label htmlFor="first_name" >
                                            First Name
                                        </label>
                                        <div className={style.input_placeholder_email}>
                                            <input
                                                type="text"
                                                id="FirstName"
                                                name="first_name"
                                                onChange={handleInputChange}
                                                className={style.input_email}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={`${style.text_email} col2-start`}>
                                        <label htmlFor="LastName" >
                                            Last Name
                                        </label>
                                        <div className={style.input_placeholder_email}>
                                            <input
                                                type="text"
                                                id="LastName"
                                                name="last_name"
                                                onChange={handleInputChange}
                                                className={style.input_email}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={`${style.text_email} `}>
                                        <label htmlFor="Age" >
                                            Age
                                        </label>
                                        <div className={style.input_placeholder_email}>
                                            <input
                                                type="text"
                                                id="Age"
                                                name="age"
                                                onChange={handleInputChange}
                                                className={style.input_email}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={`${style.text_email} `}>
                                        <label htmlFor="Gender" >
                                            Gender
                                        </label>
                                        <select
                                            id="Gender"
                                            name="gender"
                                            className={`${style.select}`}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>



                                <div className={`${style.text_email} mt-4`}>
                                    <label htmlFor="HomeAddress" >
                                        Home Address
                                    </label>
                                    <div className={style.input_placeholder_email}>
                                        <input
                                            type="text"
                                            id="HomeAddress"
                                            name="address"
                                            value={addresses}
                                            onChange={handleInputChange}
                                            className={style.input_email}
                                         
                                        />
                                    </div>
                                </div>

                                {/* <div className={`${style.text_email} mt-4`}>
                                    <label htmlFor="Status" >
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        className={`${style.select} block p-1`}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select status</option>
                                        <option value="0">Cancelled</option>
                                        <option value="1">Confirmed</option>
                                    </select>
                                </div> */}


                                <div className='grid grid-cols-2 gap-4 mt-4'>
                                    <div className={`${style.text_email} `}>
                                        <label htmlFor="Latitude">Latitude</label>
                                        <div className={style.input_placeholder_email}>
                                            <input
                                                type="number"
                                                id="Latitude"
                                                name="latitude"
                                                // onClick={() => setShowMap(!showMap)}

                                                value={formData.latitude || ""}
                                                onChange={handleInputChange}
                                                // readOnly
                                                className={style.input_email}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={`${style.text_email} `}>
                                        <label htmlFor="Longitude">Longitude</label>
                                        <div className={style.input_placeholder_email}>
                                            <input
                                                type="number"
                                                id="Longitude"
                                                name="longitude"
                                                value={formData.longitude || ""}
                                                onChange={handleInputChange}
                                                // readOnly
                                                className={style.input_email}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:cols-2 sm:cols-1">
                                <div style={{ width: "100%", height: "405px" }}>
                                    <MapSelect
                                        latitude={Math.min(90, Math.max(-90, isNaN(parseFloat(formData.latitude)) ? 0 : parseFloat(formData.latitude)))}  // ตรวจสอบว่าเป็น NaN หรือไม่
                                        longitude={Math.min(180, Math.max(-180, isNaN(parseFloat(formData.longitude)) ? 0 : parseFloat(formData.longitude)))}  // ตรวจสอบว่าเป็น NaN หรือไม่
                                        onLocationChange={handleLocationChange}  // ส่งค่าพิกัดที่อัปเดตไปยัง handleLocationChange
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="cols-6 justify-end sm:flex sm:items-center sm:gap-4 py-8">
                            <button
                                type="submit"
                                className={style.btn_add}
                            >
                                Submit
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div >
    );
};

export default addStudent;
