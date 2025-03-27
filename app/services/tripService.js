import { getAuth } from "firebase/auth";
// const host = process.env.NEXT_PUBLIC_API_HOST;
// const port = process.env.NEXT_PUBLIC_API_PORT;

// // สร้าง base URL
// const apiBaseUrl = `${host}:${port}`;
import configService from "./configService";

const fetchTrips = async (idToken) => {
  if (!idToken) {
    console.error("ID token is required to fetch trips");
    return [];
  }

  try {
    const response = await fetch(`${configService.baseURL}/api/trips`, {
      headers: {
        Authorization: `Bearer ${idToken}`, // Send token in headers
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(`Failed to fetch trips: ${response.status} ${response.statusText}`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
};

// ฟังก์ชันสำหรับบันทึก Trip
const saveTrip = async (idToken, tripData) => {
  try {
    const response = await fetch(`${configService.baseURL}/api/trips/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}` // ใช้ token ถ้ามี Authentication
      },
      body: JSON.stringify(tripData)
    });

    if (!response.ok) {
      throw new Error(`Failed to save trip: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📌 Trip Saved:", data);
    return data;
  } catch (error) {
    console.error("❌ Error saving trip:", error);
    throw error;
  }
};


const deleteTripService = async (idToken, tripId) => {
  try {
    const response = await fetch(`${configService.baseURL}/api/trips/${tripId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete trip: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in deleteTripService:", error);
    throw error;
  }
};




export { fetchTrips, saveTrip, deleteTripService };
