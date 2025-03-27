import { getAuth } from "firebase/auth";

// const host = process.env.NEXT_PUBLIC_API_HOST;
// const port = process.env.NEXT_PUBLIC_API_PORT;

// // สร้าง base URL
// const apiBaseUrl = `${host}:${port}`;

import configService from "../services/configService";

//get students
export const fetchStudents = async (currentPage) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("User is not logged in");

    const idToken = await user.getIdToken();
    // console.log("JWT Token:", idToken);

    const response = await fetch(`${configService.baseURL}/api/students/page/${currentPage}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }

    const data = await response.json();
    return data; // Return the data to the caller
  } catch (error) {
    console.error(error);
    throw error; // Re-throw error to handle in the calling component
  }
};


export const fetchStudentsOrderby = async (currentPage, orderBy = "first_name", orderDir = "ASC") => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("User is not logged in");

    const idToken = await user.getIdToken();

    // Prepare the query parameters for sorting
    const orderByString = Array.isArray(orderBy) ? orderBy.join(",") : orderBy;

    // Build the API request URL
    const url = `${configService.baseURL}/api/students/order/page/${currentPage}?order_by=${orderByString}&order_dir=${orderDir}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch students");
    }

    return await response.json();  // Return the sorted student data
  } catch (error) {
    console.error(error);
    throw error;  // Rethrow error for handling at the component level
  }
};


// search
export const searchStudents = async (searchQuery, currentPage) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User is not logged in");
    }

    const idToken = await user.getIdToken();
    const response = await fetch(
      `${configService.baseURL}/api/students/search?page=${currentPage}&find=${searchQuery}`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${idToken}` },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("No students found for search query:", searchQuery);
        return { students: [], total_count: 0 }; // Return empty data if not found
      }
      throw new Error("Error fetching search results");
    }

    const data = await response.json();

    // Ensure response data is valid
    if (!data || !data.students || !Array.isArray(data.students)) {
      console.warn("Unexpected API response, returning empty list.");
      return { students: [], total_count: 0 };
    }

    return data;
  } catch (error) {
    console.error("searchStudents error:", error);
    return { students: [], total_count: 0 }; // Return empty list in case of error
  }
};

// search by filter on Home To School
export const fetchStudentsByStatus = async (filterStatus, currentPage) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User is not logged in");
    }

    const idToken = await user.getIdToken();
    const response = await fetch(
      `${configService.baseURL}/api/students/status/${filterStatus}/page/${currentPage}`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${idToken}` },
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching students with filter");
    }

    return await response.json();
  } catch (error) {
    console.error("fetchStudentsByStatus error:", error);
    throw error;
  }
};

// 🔹 Search By Filters on Student
export const searchByFilterStudents = async (selectedFilter, currentPage, searchQuery) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("User is not logged in");

    const idToken = await user.getIdToken();
    const response = await fetch(
      `${configService.baseURL}/api/students/search?filter=${selectedFilter}&page=${currentPage}&find=${searchQuery}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("No students found for search query:", searchQuery);
        return { students: [], total_count: 0, error: "No results found." }; // Return empty array with message
      }
      throw new Error(`Error fetching search results: ${response.status}`);
    }

    const data = await response.json();

    // Ensure response data is valid
    if (!data || !Array.isArray(data.students)) {
      console.warn("Unexpected API response, returning empty list.");
      return { students: [], total_count: 0 };
    }

    return { students: data.students, total_count: data.total_count };
  } catch (error) {
    console.error("searchStudents error:", error);
    return { students: [], total_count: 0, error: error.message };
  }
};

// update status
export const updateStudentStatus = async (studentId, status) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not logged in');
  }

  const idToken = await user.getIdToken();

  try {
    const response = await fetch(
      `${configService.baseURL}/api/students/status/${studentId}`, // Assuming `baseURL` is set in `configService`
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status, // status is either 0 or 1
        }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update status');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};


export const fetchStudentBatchData = async (idToken, coordinates) => {
  try {
    // สร้าง URL
    const url = `${configService.baseURL}/api/students/lnglat/batch`;

    // เรียก API ด้วย fetch
    const response = await fetch(url, {
      method: 'POST', // ใช้ POST method
      headers: {
        'Authorization': `Bearer ${idToken}`, // เพิ่ม Bearer token ใน headers
      },
      body: JSON.stringify(coordinates), // ส่งพิกัดหลายชุดใน body
    });

    // ตรวจสอบสถานะการตอบกลับ
    if (!response.ok) {
      // หากไม่สำเร็จ ขว้างข้อผิดพลาดพร้อมสถานะ
      const errorText = await response.text();
      throw new Error(`Failed to fetch data from API (status: ${response.status}): ${errorText}`);
    }

    // แปลง response เป็น JSON
    const data = await response.json();
    return data; // ส่งข้อมูลที่ได้กลับไป
  } catch (error) {
    // ดักจับข้อผิดพลาดที่เกิดขึ้น
    console.error("Error fetching batch student data: ", error);
    throw error; // ขว้างข้อผิดพลาดออกไปเพื่อให้ caller จัดการ
  }
};

//import list student
export const createBatchStudents = async (students) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User is not logged in");

  const idToken = await user.getIdToken();
  try {
    const response = await fetch(`${configService.baseURL}/api/students/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(students), // ส่งข้อมูลในรูปแบบ JSON
    });

    if (!response.ok) {
      throw new Error('Failed to create students');
    }

    const result = await response.json();
    console.log('Batch students created successfully:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// ฟังก์ชันสำหรับการดึงข้อมูลนักเรียนตาม ID
export const getStudentById = async (id) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("User is not logged in");

    const idToken = await user.getIdToken();
    const response = await fetch(`${configService.baseURL}/api/students/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`, // Add Authorization header
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch student data');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching student:", error);
    return null;
  }
};

// ฟังก์ชันสำหรับการอัปเดตข้อมูลนักเรียน
export const updateDataById = async (id, formData) => {

  console.log(id);
  console.log(formData);


  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User is not logged in");

  const idToken = await user.getIdToken();
  const response = await fetch(`${configService.baseURL}/api/students/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }
  return await response.json();
};


//delete checkbox
// export const deleteStudents = async (id) => {
//   try {
//     const auth = getAuth();
//     const user = auth.currentUser;

//     if (!user) throw new Error("User is not logged in");

//     const idToken = await user.getIdToken();
//     const response = await fetch(`${configService.baseURL}/api/students/${id}`, {
//       method: "DELETE",
//       headers: {
//         'Authorization': `Bearer ${idToken}`,
//       },
//       body: JSON.stringify({ id }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to delete students");
//     }

//     return await response.json();

//   } catch (error) {
//     console.error("Error in deleteStudents service:", error);
//     throw error;
//   }
// }

export const batchDeleteStudents = async (ids) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("User is not logged in");

    const idToken = await user.getIdToken();
    const response = await fetch(`${configService.baseURL}/api/students/batch-delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ ids }), // Send the array of IDs in the body
    });

    const result = await response.json();
    console.log(result); // Log the result from the server
  } catch (error) {
    console.error('Error deleting students:', error);
  }
};
