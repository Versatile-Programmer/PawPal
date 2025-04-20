import { API_ENDPOINTS } from "@/config/apiConfig";
import axios from "axios";
import {
  AdoptionRequest,
  GetRequestsResponse,
  ReceivedRequestData,
  SentRequestData,
} from "@/types/petTypes"; // Import type

// Define the data structure needed to send a request
interface SubmitRequestPayload {
  petId: number | string; // ID of the pet being requested
  messageToLister?: string | null; // Optional message
}

// Define the expected success response structure
interface SubmitRequestResponse {
  message: string;
  data: AdoptionRequest; // Backend returns the created request object
}

/**
 * Submits a new adoption request for a specific pet.
 * Auth token is handled by apiClient or needs to be added manually.
 */
export const submitAdoptionRequest = async (
  payload: SubmitRequestPayload
): Promise<SubmitRequestResponse> => {
  try {
    // --- OR plain Axios ---
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("User not authenticated.");
    const response = await axios.post<SubmitRequestResponse>(
      API_ENDPOINTS.SUBMIT_REQUEST, // Define this endpoint URL
      payload,
      { headers: { Authorization: token } }
    );

    console.log("Adoption request submission response:", response);
    return response.data;
  } catch (error) {
    console.error("Error submitting adoption request:", error);
    throw error;
  }
};

export const getReceivedAdoptionRequests = async (): Promise<
  GetRequestsResponse<ReceivedRequestData>
> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("User not authenticated.");
    const response = await axios.get<GetRequestsResponse<ReceivedRequestData>>(
      API_ENDPOINTS.GET_RECEIVED_REQUESTS,
      { headers: { Authorization: token } }
    );
    console.log("Adoption request submission response:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching received requests:", error);
    throw error;
  }
};

export const getSentAdoptionRequests = async (): Promise<
  GetRequestsResponse<SentRequestData>
> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("User not authenticated.");
    const response = await axios.get<GetRequestsResponse<SentRequestData>>(
      API_ENDPOINTS.GET_SENT_REQUESTS,
      { headers: { Authorization: token } }
    );
    console.log("Adoption request submission response:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    throw error;
  }
};
