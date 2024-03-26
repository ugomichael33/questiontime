import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const requestToken = async (email: string): Promise<string | null> => {
  try {

    const response = await axios.post(
      `${API_BASE_URL}/token`,
      JSON.stringify({ email }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.token;
  } catch (error: any) {
    if (error.response) {
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);
      console.error("Error headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error", error.message);
    }
    console.error("Error config:", error.config);
    return null;
  }
};
