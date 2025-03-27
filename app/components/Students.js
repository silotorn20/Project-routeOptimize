"use client";
import { useEffect, useState, useRef } from "react";
// css
import St from '../css/student.module.css';
// modals
import AddStudent from "../modals/AddStudentModal"
import ListStudent from "../modals/ListStudentModal"
import EditStudent from "../modals/EditStudentModal"
import ModalDelete from "../modals/ModalDelete";
import showAlert from "../modals/ShowAlert";
import DownLoadModal from "../modals/DownloadModal";
// services
import HandleDelete from "../services/HandleDelete";
import { fetchStudents, deleteStudents, batchDeleteStudents, searchByFilterStudents, fetchStudentsOrderby } from "../services/studentService";

export default function StudentSidebar({ isOpen, onClose, mapRef }) {
  if (!isOpen) return null; // ถ้า Sidebar ไม่เปิด ให้คืนค่า null

  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState(null);

  ////////////////////////////////sort/////////////////////////////////////////
  // const [sortField, setSortField] = useState(null);
  // const [sortOrder, setSortOrder] = useState(("asc"))

  // const handleSort = (field) => {
  //   const order = sortField === field && sortOrder === "asc" ? "desc" : "asc"; // สลับ asc <-> desc
  //   setSortField(field);
  //   setSortOrder(order);

  //   const sortedStudents = [...students].sort((a, b) => {
  //     if (a[field] < b[field]) return order === "asc" ? -1 : 1;
  //     if (a[field] > b[field]) return order === "asc" ? 1 : -1;
  //     return 0;
  //   });

  //   setStudents(sortedStudents);
  // };
  const [sortField, setSortField] = useState(["first_name", "last_name"]);
  const [sortOrder, setSortOrder] = useState("ASC");
  const isFetched = useRef(false);

  useEffect(() => {
    if (sortField && sortOrder && isFetched.current) {  // Only fetch if sortField and sortOrder are set
      async function loadStudent() {
        try {
          setLoading(true);
          const data = await fetchStudentsOrderby(currentPage, sortField, sortOrder);
          setStudents(data.students); // Assuming data.students holds the student list
          setLoading(false);
        } catch (error) {
          console.error("Error fetching students:", error);
          setLoading(false);
        }
      }
      loadStudent();
    }
  }, [currentPage, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sorting direction
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      // Set the field to sort by and default to ascending order
      setSortField(field);
      setSortOrder("ASC");
    }
    // Set isFetched to true after the first sort interaction
    isFetched.current = true;
  };
  ///////////////////////////Function Insert Student///////////////////////////

  const [openAddStudent, setOpenAddStudent] = useState(false);
  const openAddStudentModal = () => setOpenAddStudent(true);//open modal AddStudent
  const closeAddStudentModal = () => setOpenAddStudent(false);
  const addStudent = (Student) => {
    loadStudents(Student);
  };

  const [openListStudent, setOpenListStudent] = useState(false);
  const openListStudentModal = () => setOpenListStudent(true);//open modal Import Student
  const closeListStudentModal = () => setOpenListStudent(false);
  const addListStudent = (Student) => {
    loadStudents(Student);
  };

  ////////////////////////Function Edit Student/////////////////////////////

  const [sid, setsid] = useState(null);//ส่งid

  const [openEditStudent, setOpenEditStudent] = useState(false);
  const openEditStudent2 = (id) => {//open modal Edit Student
    setsid(id);
    setOpenEditStudent(true)
  }
  const closeEditStudentModal = () => setOpenEditStudent(false);
  const updateStudent = (updatedStudent) => {
    loadStudents(updatedStudent);
  };

  ////////////////////////Function Delete Student/////////////////////////////

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  //open modal Delete Student
  const openModalDelete = (id) => {
    setSelectedUserId(id);
    setIsModalDeleteOpen(true);
  };

  const closeModalDelete = () => {
    setIsModalDeleteOpen(false);
    setSelectedUserId(null);
  };

  //delete student on id
  const confirmDelete = async () => {
    if (selectedUserId !== null) {
      await batchDeleteStudents([selectedUserId]);
      setStudents((prevStudents) => prevStudents.filter((student) => student.id !== selectedUserId));
      closeModalDelete();

      showAlert("Deleted success!")
      mapRef.current?.refetchMark();
    }
  };

  ////////////////////////////////ดึงข้อมูลนักเรียนทั้งหมด//////////////////////////////////////
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [loading, setLoading] = useState(false); // Loading state for search
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const loadStudents = async () => {
    try {
      let data;
      if (searchQuery.trim()) {
        data = await searchByFilterStudents(selectedFilter, currentPage, searchQuery);
      } else {
        data = await fetchStudents(currentPage);
        console.log('Student all: ', data);

      }
      setStudents(data.students);
      setTotalCount(data.total_count);  // Set the total count of students
      setError(null);  // Clear any previous error
    } catch (error) {
      setError(error.message);
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery); // ตัวแปรเก็บค่าค้นหาดีเลย์

  // ดีเลย์การอัปเดตค่าค้นหา
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000); // หน่วง 1000ms

    return () => clearTimeout(handler); // ล้าง timer ถ้ามีการพิมพ์ใหม่
  }, [searchQuery]);


  useEffect(() => {
    if (!debouncedSearch && isFetched.current) {
      isFetched.current = true;
      loadStudents(); // โหลดข้อมูลครั้งแรก
      return;
    }

    if (debouncedSearch.trim() === "") {
      loadStudents(); // ถ้าค้นหาว่าง ให้โหลดข้อมูลทั้งหมด
      return;
    }

  }, [currentPage, debouncedSearch, selectedFilter, setStudents]);


  //////////////////////////////////Search/////////////////////////////////////

  const debounceTimeout = useRef(null);
  //filter
  const filters = ["All", "first_name", "last_name", "age", "gender", "address"];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log("Search Query (Typing):", value);

    // อัปเดตค่าให้ Input แสดงผลตามที่พิมพ์
    setSearchQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current); // ล้าง timeout ก่อนหน้า
    }

    debounceTimeout.current = setTimeout(() => {
      handleSearch(value);
    }, 1000); // รอ 1 วินาทีก่อนทำงาน
  };

  const handleOptionClick = (filter) => {
    setSelectedFilter(filter);
    console.log('Selected option:', filter);
    setIsOpenDropdown(false);
  };

  /////////////ดึงข้อมูลการค้นหา////////////////

  const handleSearch = async (searchQuery) => {
    // e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    if (searchQuery.trim() === "") return;

    setLoading(true); // เริ่มสถานะการโหลด
    console.log("Searching for:", searchQuery);

    try {
      const result = await searchByFilterStudents(selectedFilter, currentPage, searchQuery);

      setStudents(result.students);
      setTotalCount(result.total_count);
      setError(result.error || null); // Handle errors from service
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  ///////////////////////////////CheckBox////////////////////////////////////

  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalDeleteAll, setIsModalDeleteAll] = useState(false);
  //open modal Delete Student
  const openModalDeleteAll = () => {
    setIsModalDeleteAll(true);
  };

  const closeModalDeleteAll = () => {
    setIsModalDeleteAll(false);
  };
  // Handle "Select All" checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // ถ้าเลือกทั้งหมดให้เลือกทุก ID ในหน้าปัจจุบัน
      setSelectedRows(students.map((student) => student.id));
    } else {
      // ถ้าไม่เลือกทั้งหมดให้ลบการเลือกทั้งหมด
      setSelectedRows([]);
    }
  };

  // Handle individual row selection
  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      alert("Please select items to delete");
      return;
    }


    try {
      // console.log("Starting delete for ID:", selectedRows);

      // ลบทีละ ID ใน selectedRows
      // if (selectedRows.length === 1) {
      //   // 🔹 ลบทีละ ID ถ้ามีเพียง 1 รายการ
      //   await batchDeleteStudents([selectedRows[0]]);
      // } else {
      // 🔹 ลบหลาย ID พร้อมกัน (ถ้า API รองรับ)
      await batchDeleteStudents(selectedRows);
      // }

      // อัปเดต UI หลังลบสำเร็จ
      setStudents((prevStudents) =>
        prevStudents.filter((student) => !selectedRows.includes(student.id))
      );

      console.log("delete completed.");

      setSelectedRows([]); // รีเซ็ตการเลือก

      closeModalDeleteAll();
      showAlert("Deleted success!")
      mapRef.current?.refetchMark();
      // setIsModalDeleteOpen(true)
    } catch (error) {
      alert("An error occurred while deleting data.");
      console.error("Error:", error);
    }

  };

  //////////////////////////////////คำนวณจำนวนหน้า/////////////////////////////////////////

  const totalPages = Math.ceil(totalCount / perPage);//จำนวนหน้าทั้งหมด
  const maxButtonsToShow = 5; // จำนวนปุ่มที่ต้องการแสดง
  const startPage = Math.floor((currentPage - 1) / maxButtonsToShow) * maxButtonsToShow + 1;
  const endPage = Math.min(startPage + maxButtonsToShow - 1, totalPages);

  // ฟังก์ชันสำหรับการเปลี่ยนหน้า
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  //button next page
  const handleNextPage = () => {
    if (currentPage + maxButtonsToShow <= totalPages) {
      setCurrentPage(currentPage + maxButtonsToShow);
    } else {
      setCurrentPage(totalPages)
    }
  };

  //button previous page
  const handlePrev = () => {
    if (currentPage - maxButtonsToShow >= 1) {
      setCurrentPage(currentPage - maxButtonsToShow);
    } else {
      setCurrentPage(1)
    }
  };

  //Number on Button
  const pageButtons = [];
  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <li key={i}>
        <button
          onClick={() => handlePageChange(i)}
          className={`block size-8 border ${currentPage === i ? 'bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
        >
          {i}
        </button>
      </li>
    );
  }

  ///////////////////////DownLoad File .csv///////////////////////
  const [showModal, setShowModal] = useState(false);

  // ฟังก์ชันเมื่อกดปุ่ม
  const onButtonClick = () => {
    setShowModal(true); // แสดง Modal เมื่อกดปุ่ม
  };

  const downloadCSV = () => {
    // ข้อมูลที่คุณให้มาในรูปแบบ CSV
    const csvContent = `student_id,first_name,last_name,age,gender,address,latitude,longitude,status
"000001","Ella","Foster",20,"Male","4702 Hickory St, Birchwood",-37.77585558,144.99294174,1
"000002","Ella","Harrison",15,"Male","4803 Maple St, Cedar Valley",-37.77473863,144.9928556,1
"000003","Ella","Mitchell",18,"Female","4904 Elmwood St, Pine Grove",-37.77466106,144.99322014,1
"000004","Ella","Stewart",19,"Male","5005 Oakwood St, Redwood Valley",-37.77426881,144.99287621,1
"000005","Ella","Carter",16,"Female","5106 Birchwood St, Willow Heights",-37.77405037,144.9941318,1`;

    // สร้างลิงก์สำหรับดาวน์โหลด
    const link = document.createElement('a');
    const blob = new Blob([csvContent], { type: 'text/csv' }); // สร้าง Blob สำหรับไฟล์ CSV
    const url = URL.createObjectURL(blob); // สร้าง URL สำหรับ Blob

    link.href = url;
    link.download = 'Example.csv'; // ตั้งชื่อไฟล์เมื่อดาวน์โหลด
    document.body.appendChild(link);
    link.click(); // คลิกเพื่อดาวน์โหลดไฟล์
    document.body.removeChild(link); // ลบลิงก์ออกจาก DOM
  };


  const onDownload = () => {
    downloadCSV(); // เรียกฟังก์ชันดาวน์โหลด

    showAlert("Download complete!");
    setShowModal(false); // ปิด Modal
  };

  const onCloseModal = () => {
    setShowModal(false); // ปิด Modal
  };

  //////////////////////responsive mobile////////////////////////////////
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [height, setHeight] = useState("60vh");
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
      setHeight("60vh"); // ย่อ
    } else if (touchDiff < -50) {
      setHeight("100vh"); // ขยาย
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;

    if (currentTouch - startTouch < -50) {
      setHeight("100vh");
    } else if (currentTouch - startTouch > 50) {
      setHeight("60vh");
    }
  };

  return (
    <aside
      id="additional-sidebar"
      className={`fixed z-50  w-full lg:w-[1250px] h-[500px] sm:w-[1250px] h-[500px] md:w-[500px] h-[500px] 
    sm:h-screen bg-white border-t sm:border-t-0 sm:border-r border-gray-300 
             bottom-0 sm:top-0 lg:top-0 transition-all ease-in-out`}
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
        className="bg-transparent hover:bg-gray-200  rounded-lg z-20 p-1.5 absolute top-1 end-4 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
      <div className="h-full px-3 pb-4 flex flex-col">
        <header>
          <div className="mx-auto max-w-screen-xl  py-8 sm:px-2 sm:py-12 lg:px-2">
            <div className="lg:flex flex-col items-start gap-4 lg:flex-row md:items-center md:justify-between md:items-start">
              {/* <div>
                <h1 className={St.text}>Students</h1>
              </div> */}
              <div className="bg-white border border-gray-300 sm:w-[460px] rounded-md mb-2">
                <div className="relative flex">
                  <span className="inset-y-0 start-0 grid w-12 place-content-center">
                    {/* icon Search */}
                    <button type="button">
                      <span className="sr-only">Search</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
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
                            {filter.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap  sm:gap-4 md:gap-2 gap-4 mb-3">
                <div>
                  <button onClick={openAddStudentModal} className={St.btn_add}>
                    Add New Student
                  </button>
                </div>
                <div >
                  <button onClick={openListStudentModal} className={St.btn_addList}>
                    Import list of Student
                  </button>
                </div>
                <div >
                  <button className={St.btn_example} onClick={onButtonClick}>
                    Example File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* <p><a class="text-blue-600 underline underline-offset-1 decoration-blue-600 hover:opacity-80 focus:outline-none focus:opacity-80 flex justify-end mb-5 mr-2" href="#">Example File</a></p> */}
        {/* Dropdown เมื่อเลือก Checkbox */}
        <div className="relative">
          {selectedRows.length > 0 && (
            <div className="absolute bottom-0 left-0 flex items-center space-x-4 p-3 ">
              <button
                className="flex items-center space-x-2 text-red-500 hover:text-red-700"
                onClick={openModalDeleteAll}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 border-b ">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="SelectAll"
                      className="size-5 mt-1 rounded border-gray-300 bg-white text-blue-500 focus:ring-blue-500 accent-blue-500"
                      checked={selectedRows.length > 0 && selectedRows.length === students.length ? true : false}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                  </div>
                </th>
                <th
                  className={`${St.Header_FN} whitespace-nowrap px-4 py-2`}
                  onClick={() => handleSort("first_name")}
                >
                  <div className=" flex items-center justify-between">
                    First Name
                    {sortField === "first_name" && (
                      sortOrder === "ASC" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      )
                    )}
                  </div>
                </th>

                <th className={`${St.Header_LN} whitespace-nowrap px-4 py-2`}
                  onClick={() => handleSort("last_name")}
                >
                  <div className="flex items-center justify-between">
                    Last Name

                    {sortField === "last_name" && (
                      sortOrder === "ASC" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      )
                    )}
                  </div>
                </th>
                <th className={`${St.Header_Age} whitespace-nowrap px-4 py-2`}>Age</th>
                <th className={`${St.Header_GD} whitespace-nowrap px-4 py-2`}>Gender</th>
                <th className={`${St.Header_HAdress} whitespace-nowrap px-4 py-2`}>Home Address</th>
                <th className={`${St.Header_Lat} whitespace-nowrap px-4 py-2`}>Latitude</th>
                <th className={`${St.Header_Lng} whitespace-nowrap px-4 py-2`}>Longitude</th>
                <th className={`${St.Header_Status} whitespace-nowrap px-4 py-2`}>Status</th>
                <th className="whitespace-nowrap px-4 py-2 ">Action</th>
              </tr>
            </thead>

            <tbody className={`${St.text_Student} divide-y divide-gray-200`}>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">No results found</td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={index}>
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="SelectAll"
                          className="size-5 mt-0.5 rounded border-gray-300 bg-white text-blue-500 focus:ring-blue-500 accent-blue-500"
                          checked={selectedRows.includes(student.id)}
                          onChange={() => handleRowSelect(student.id)} />
                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">{student.first_name} </td>
                    <td className="whitespace-nowrap px-4 py-2">{student.last_name}</td>
                    <td className={`${St.detail_Age} whitespace-nowrap px-4 py-2`}>{student.age}</td>
                    <td className="whitespace-nowrap px-4 py-2">{student.gender}</td>
                    <td
                      className="whitespace-nowrap px-4 py-2"
                      onCopy={(e) => {
                        e.preventDefault();
                        e.clipboardData.setData('text/plain', student.address);
                      }}
                    >
                      {student.address.length > 35
                        ? student.address.substring(0, 35) + "..."
                        : student.address}
                    </td>
                    <td className={`${St.detail_Lat} whitespace-nowrap px-4 py-2`}>{student.latitude}</td>
                    <td className={`${St.detail_Lng} whitespace-nowrap px-4 py-2`}>{student.longitude}</td>
                    <td className={`${St.detail_status} whitespace-nowrap px-4 py-2`}>
                      <button
                        type="button"
                        className={`${student.status === 1
                          ? St.text_confirm
                          : St.text_cancelled
                          } `}
                      >
                        {student.status === 1 ? 'Confirmed' : 'Cancelled'}
                      </button>
                    </td>
                    {/* <td className="sticky inset-y-0 end-0 px-4 py-2"></td> */}
                    <td className="whitespace-nowrap px-4 py-2">
                      <div className="flex space-x-2 ">
                        <button onClick={() => openEditStudent2(student.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#007BFF" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button onClick={() => openModalDelete(student.id)} >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#dc2626" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <ol className="flex items-center flex-column flex-wrap md:flex-row justify-between lg:pt-20 md:pt-32">
          <div className="flex flex-1 justify-between sm:hidden pt-4 pb-2">
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent default anchor behavior
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${currentPage > 1 ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              Previous
            </button>
            <span className="py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent default anchor behavior
                if (currentPage >= 1) setCurrentPage(currentPage + 1);
              }}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${currentPage < Math.ceil(totalCount / perPage)
                ? 'bg-white text-gray-700 hover:bg-gray-50'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`${St.text_showing}`}>
                Showing
                <span className="px-2">{currentPage}</span>
                to
                <span className="px-2">{totalPages}</span>
              </p>
            </div>
          </div>
          {/* ปุ่ม Prev */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <li>
              <button
                onClick={handlePrev}
                className={`block size-8 rounded-l border border-gray-200 bg-white text-gray-900 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Prev Page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-7"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>

            {/* ปุ่มตัวเลข */}
            {pageButtons}

            {/* ปุ่ม Next */}
            <li>
              <div dir="rtl">
                <button
                  onClick={handleNextPage}
                  className={`block size-8 rtl:rounded-r border border-gray-200 bg-white text-gray-900 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Next Page</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-7"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </li>
          </div>
        </ol>
      </div>
      <AddStudent mapRef={mapRef} isOpenAddStudent={openAddStudent} onCloseAddStudent={closeAddStudentModal} onAddStudent={addStudent}></AddStudent>
      <ListStudent mapRef={mapRef} isOpenListStudent={openListStudent} onCloseListStudent={closeListStudentModal} onAddListStudent={addListStudent}></ListStudent>
      <EditStudent mapRef={mapRef} isOpenEditStudent={openEditStudent} onCloseEditStudent={closeEditStudentModal} id={sid} updateStudent={updateStudent}></EditStudent>
      <ModalDelete isOpen={isModalDeleteOpen} onClose={closeModalDelete} type='deleteStudent' onConfirm={confirmDelete}></ModalDelete>
      <ModalDelete isOpen={isModalDeleteAll} onClose={closeModalDeleteAll} type='deleteAll' onConfirm={handleBulkDelete}></ModalDelete>
      <DownLoadModal isOpen={showModal} onClose={onCloseModal} onDownload={onDownload}></DownLoadModal>
    </aside >
  );
}