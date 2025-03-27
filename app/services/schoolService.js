// const host = process.env.NEXT_PUBLIC_API_HOST;
// const port = process.env.NEXT_PUBLIC_API_PORT;

// // สร้าง base URL
// const apiBaseUrl = `${host}:${port}`;
import { getAuth } from "firebase/auth";
import configService from "./configService";

const fetchMapCenter = async () => {
  try {
      const auth = getAuth();
            const user = auth.currentUser;
    
            if (!user) throw new Error("User is not logged in");
    
            const idToken = await user.getIdToken();
    const response = await fetch(`${configService.baseURL}/api/schools`, {
      headers: {
        'Authorization': `Bearer ${idToken}`, // ส่ง token ใน headers
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const latitude = parseFloat(data[0].latitude);
      const longitude = parseFloat(data[0].longitude);

      // ถ้าแปลงไม่ได้ให้แสดงข้อความเตือน
      if (isNaN(latitude) || isNaN(longitude)) {
        return [11, 11];  // ใช้ค่าเริ่มต้นถ้าแปลงไม่ได้
      }
      return [longitude, latitude];
    } else {
      return [11, 11];
    }
  } catch (error) {
    return [11, 11];
    console.error("Error fetching marker data: ", error);
  }
};

const fetchSchool = async (idToken) => {
  try {
    const response = await fetch(`${configService.baseURL}/api/schools`, {
      headers: {
        'Authorization': `Bearer ${idToken}`, // ส่ง token ใน headers
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return;
    }
  } catch (error) {
    return;
  };
}


// ฟังก์ชันสำหรับบันทึก Trip
const createSchool = async (idToken, dataSchool) => {
  try {
    const response = await fetch(`${configService.baseURL}/api/schools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}` // ใช้ token ถ้ามี Authentication
      },
      body: JSON.stringify(dataSchool)
    });

    if (!response.ok) {
      throw new Error(`Failed to save trip: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error saving trip:", error);
    throw error;
  }
};



const updateSchool = async (idToken, schoolId, schoolData) => {
  try {
    const response = await fetch(`${configService.baseURL}/api/schools/${schoolId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify(schoolData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update school: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating school:", error);
    throw error;
  }
};


export {fetchMapCenter, fetchSchool, createSchool, updateSchool};