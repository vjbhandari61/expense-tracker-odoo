// api.js (or wherever you have your axios instance)
import axios from "axios";

const api = axios.create({
  baseURL: "https://bf1374a32569.ngrok-free.app/api",
});

// Signup admin function
export const signupAdmin = async (adminData) => {
  try {
    const response = await api.post("/auth/signup", adminData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Signup success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Signup failed:", error.response?.data || error.message);
    throw error;
  }
};
