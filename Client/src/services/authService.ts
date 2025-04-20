import axios from "axios";
import { API_ENDPOINTS } from "../config/apiConfig"; // Import endpoints if using the config file

// Define the structure of the data needed for signup
export interface SignupData {
  fullName: string; // Frontend uses fullName
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword:string;
}

// Define the expected structure of a successful response (adjust if needed)
interface RegisterSuccessResponse {
  message: string;
  // Include other fields if your backend sends them on success
}

export interface LoginData {
  email: string;
  password: string;
}

interface LoginUserData {
  id: number; // Or string, depending on your user ID type
  name: string;
  email: string;
  token: string; // Includes "Bearer " prefix from backend
}

// Define the structure of the validation error response from your backend

interface LoginSuccessResponse {
  message: string;
  data: LoginUserData;
}
/**
 * Makes an API call to register a new user.
 *
 * @param signupData - The user's signup information (fullName, email, password).
 * @returns A promise that resolves with the success response message.
 * @throws An error if the API call fails (Axios errors are automatically thrown for non-2xx responses).
 */
export const registerUser = async (
  signupData: SignupData
): Promise<RegisterSuccessResponse> => {
  try {
    // Map frontend `fullName` to backend `name`
    const payload = {
      name: signupData.fullName,
      email: signupData.email,
      contactNumber: signupData.contactNumber,
      password: signupData.password,
      confirmPassword: signupData.confirmPassword
    };

    console.log("Sending signup payload:", payload);

    const response = await axios.post<RegisterSuccessResponse>(
      API_ENDPOINTS.REGISTER, 
      payload
      // You might add headers here if needed, e.g.,
      // { headers: { 'Content-Type': 'application/json' } }
      // Axios usually sets Content-Type automatically for objects
    );

    console.log("Signup API success response:", response);
    return response.data; // Axios puts the response body in `data`
  } catch (error) {
    console.error("Signup API error:", error);
    // Axios throws errors for non-2xx status codes.
    // We'll handle the specifics of the error in the component,
    // but we re-throw it here so the component's catch block receives it.
    throw error;
  }
};

export const loginUser = async (
  loginData: LoginData
): Promise<LoginSuccessResponse> => {
  try {
    console.log("Sending login payload:", loginData);

    const response = await axios.post<LoginSuccessResponse>(
      API_ENDPOINTS.LOGIN,
      loginData // Send email and password directly
    );

    console.log("Login API success response:", response);
    return response.data; // Contains message and data object
  } catch (error) {
    console.error("Login API error:", error);
    // Re-throw the error for the component to handle
    throw error;
  }
};

// Helper type guards for error handling (optional but helpful)
export function isAxiosError<T = any>(
  error: any
): error is import("axios").AxiosError<T> {
  return error && error.isAxiosError === true;
}


