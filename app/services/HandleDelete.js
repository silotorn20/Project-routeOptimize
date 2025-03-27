import { getAuth } from "firebase/auth";

import configService from "./configService";

const HandleDelete = async (id) => {

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("User is not logged in");

    const idToken = await user.getIdToken();
    console.log("JWT Token:", idToken);

    // เรียก API
    const response = await fetch(`${configService.baseURL}/api/students/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        'id': id
      })
    });

    const result = await response.json();

    // ตรวจสอบว่าการลบสำเร็จหรือไม่
    if (response.ok) {
      // alert("Data deleted successfully");
      console.log("Data deleted successfully:", result);
      return true;
    } else {
      // alert("Failed to delete data");
      console.error("Failed to delete data:", result);
      return false;
    }
  } catch (error) {
    // จัดการข้อผิดพลาดและแสดงข้อความใน console
    console.error("Error occurred:", error);
    return false
  }
};

export default HandleDelete;
