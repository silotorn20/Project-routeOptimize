"use client";
import Link from 'next/link';
import { useState, useEffect } from "react";
import MapSelect from '../components/MapSelect';
// css
import style from '../css/side.module.css';
// modal
import showAlert from './ShowAlert';
// service
import { getStudentById, updateDataById } from '../services/studentService';
import { getName } from "../services/GeocodingService";

const EditStudent = ({ id, isOpenEditStudent, onCloseEditStudent, updateStudent, mapRef }) => {
    // if (!isOpenEditStudent) return null;

    const [error, setError] = useState("");

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
    const [originalData, setOriginalData] = useState(null);
    const [addresses, setAddresses] = useState("");

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                if (id) {
                    const student = await getStudentById(id);
                    if (student.gender == 'Male') {
                        student.gender = 'Male';
                    }
                    else {
                        student.gender = 'Female';
                    }

                    setOriginalData(student);

                    setFormData({
                        first_name: student.first_name || "",
                        last_name: student.last_name || "",
                        age: student.age || "",
                        gender: student.gender || "",
                        address: student.address || "",
                        latitude: student.latitude || "",
                        longitude: student.longitude || "",
                        status: student.status || "",
                    });
                }
            } catch (error) {
                setError("Failed to fetch student data.");
            }
        };
        fetchStudent();
    }, [id]);

    const onClose = () => {
        if (originalData) {
            setFormData((prev) => ({
                ...prev,
                latitude: originalData.latitude, // Reset latitude
                longitude: originalData.longitude, // Reset longitude
            }));
        }
    };

    const handleLocationChange = async (lat, lng) => {
        console.log("Updated Location:", lat, lng);

        try {
            const address = await getName(lng, lat); // ✅ Wait for the API response
            console.log("Fetched Address:", address);

            setAddresses(address); // ✅ Store the resolved address in state

            setFormData((prevFormData) => ({
                ...prevFormData,
                latitude: lat.toFixed(8),  // ✅ Store latitude
                longitude: lng.toFixed(8), // ✅ Store longitude
                address: address,
            }));
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddresses("Unknown location"); // ✅ Fallback value
        }
    };


    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // update data student
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const result = await updateDataById(id, formData);
            console.log('Update Student:', result);

            updateStudent(result);
            showAlert("Edit success!")
            onCloseEditStudent();
            mapRef.current?.refetchMark();
        } catch (error) {
            // Capture the error message to display to the user
            setError(error.message);
            console.error('Update failed:', error);
        }
    };

    return (
        <div
            className={`${isOpenEditStudent ? "fixed" : "hidden"
                } overflow-y-auto overflow-x-hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-50  h-full w-full flex items-center justify-center`}
        >
            <div className="bg-white rounded-lg shadow-xl p-6 md:w-[536px] md:h-[1127px]  sm:w-[990px] sm:h-[777px] lg:w-[990px] lg:h-[777px] relative z-50 max-h-[90vh] overflow-y-auto">
                <div className=" sm:rounded-lg  flex flex-col justify-center py-5 p-5">
                    {/* <div className="flex min-h-full flex-1 flex-col justify-center px-4 py-8 lg:py-12"> */}
                    <Link href="" onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onCloseEditStudent();
                    }} className={style.link}>
                        <div className='flex'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            <div className='ml-2'>
                                Back to Student
                            </div>
                        </div>
                    </Link>
                    <div className="py-8">
                        <h2 className={style.title}>
                            Edit
                        </h2>
                        <div className={style.p}>
                            Edit the student's details, including name and home address
                        </div>
                    </div>
                    < form onSubmit={handleUpdate} className='mt-3'>
                        <div className='grid lg:grid-cols-2 gap-4 sm:grid-cols-1'>
                            <div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className={`${style.text_email} `}>
                                        <label htmlFor="first_name" >
                                            First Name
                                        </label>
                                        <div className={style.input_placeholder_email}>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData?.first_name || ''}
                                                onChange={handleInputChange}
                                                className={style.input_email}
                                            />
                                        </div>
                                    </div>

                                    <div className={`${style.text_email}`}>
                                        <label htmlFor="last_name" >
                                            Last Name
                                        </label>
                                        <div className={style.input_placeholder_email}>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData?.last_name || ''}
                                                onChange={handleInputChange}
                                                className={style.input_email}
                                            />
                                        </div>
                                    </div>


                                    <div className={`${style.text_email}`}>
                                        <label htmlFor="age" >
                                            Age
                                        </label>
                                        <div className={style.input_placeholder_email}>
                                            <input
                                                type="text"
                                                name="age"
                                                value={formData?.age || ''}
                                                onChange={handleInputChange}
                                                className={style.input_email}
                                            />
                                        </div>
                                    </div>

                                    <div className={`${style.text_email} `}>
                                        <label htmlFor="gender">
                                            Gender
                                        </label>
                                        <select
                                            name="gender"
                                            className={`${style.select} block`}
                                            value={formData?.gender || ''} // Default to an empty string if no value is set
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select gender</option> {/* Use an empty value for the default option */}
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option> {/* Ensure consistent casing */}
                                        </select>
                                    </div>
                                </div>
                                <div className={`${style.text_email} mt-4`}>
                                    <label htmlFor="address" >
                                        Home Address
                                    </label>
                                    <div className={style.input_placeholder_email}>
                                        <input
                                            type="text"
                                            name="address"
                                            readOnly
                                            className={style.input_email}
                                            value={formData?.address || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className={`${style.text_email} mt-4`}>
                                    <label htmlFor="status" >
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        className={`${style.select} block`}
                                        value={formData?.status || '0'}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select status</option>
                                        <option value="0">Cancelled</option>
                                        <option value="1">Confirmed</option>
                                    </select>
                                </div>

                                <div className='grid grid-cols-2 gap-4 mt-4'>
                                    <div className={`${style.text_email}`}>
                                        <label htmlFor="latitude" >
                                            Latitude
                                        </label>
                                        <div className={style.input_placeholder_email}>
                                            <input

                                                type="number"
                                                name="latitude"
                                                // onClick={() => setShowMap(true)}
                                                value={formData?.latitude || ''}
                                                onChange={handleInputChange}
                                                className={style.input_email}
                                            />
                                        </div>
                                    </div>

                                    <div className={`${style.text_email} `}>
                                        <label htmlFor="longitude" >
                                            Longitude
                                        </label>
                                        <div className={style.input_placeholder_email}>
                                            <input
                                                type="number"
                                                name="longitude"
                                                value={formData?.longitude || ''}
                                                onChange={handleInputChange}
                                                className={style.input_email}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="lg:cols-2 sm:cols-1">
                                    {!isNaN(parseFloat(formData.latitude)) &&
                                        !isNaN(parseFloat(formData.longitude)) ? (
                                        <div style={{ width: "100%", height: "405px" }}>
                                            <MapSelect
                                                latitude={Math.min(90, Math.max(-90, parseFloat(formData.latitude)))}
                                                longitude={Math.min(180, Math.max(-180, parseFloat(formData.longitude)))}
                                                onLocationChange={handleLocationChange}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full w-full bg-gray-100"></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-6 justify-end sm:flex sm:items-center sm:gap-4 py-8">
                            <button
                                type="submit"
                                className={style.btn_add}
                            >
                                Save
                            </button>
                        </div>
                    </form>
                    {/* </div> */}
                </div>
            </div>
        </div >
    );
};

export default EditStudent;
