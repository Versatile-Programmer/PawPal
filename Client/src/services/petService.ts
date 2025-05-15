import { Pet, PetFormData,PetDetailData, GetBrowsePetsResponse } from "@/types/petTypes";
import { API_ENDPOINTS } from "@/config/apiConfig";
import axios from "axios";
; // Import the configured Axios instance
// You might need the Pet type if CreatePetSuccessResponse includes it


// Define response structure (assuming backend returns this on success)
interface CreatePetSuccessResponse {
  message: string;
  data: PetFormData; // Or adjust if backend returns something else
}

interface GetPetByIdResponse {
  data: PetDetailData;
}
interface GetPetsResponse{
  data: Pet[];
}
interface DeletePetResponse {
  message: string;
}
/**
 * Makes an API call to create a new pet listing using FormData (for file uploads).
 * The authentication token is attached automatically by the apiClient interceptor.
 *
 * @param formData - The FormData object containing text fields and optionally the petImage file.
 * @returns A promise that resolves with the success response from the backend.
 * @throws An error if the API call fails (handled by component or interceptor).
 */
export const createPetListingFormData = async (
  formData: FormData
): Promise<CreatePetSuccessResponse> => {
  try {
    console.log("Sending create pet FormData to", API_ENDPOINTS.CREATE_PET); // Use correct endpoint name

    // --- MANUALLY GET TOKEN ---
    const token = localStorage.getItem("authToken"); // Get token from storage

    // --- Prepare Headers ---
    let headers: Record<string, string> = {
      // Let Axios set Content-Type for FormData automatically
    };

    if (token) {
      console.log("Attaching Auth Token to request header.");
      // Add the Authorization header IF token exists
      headers["Authorization"] = `${token}`; // Assuming token includes "Bearer " prefix
    } else {
      console.warn(
        "Auth token not found in localStorage. Request will likely fail on backend."
      );
      // Optional: You could throw an error here immediately if a token is strictly required
      // throw new Error("User is not authenticated.");
    }

    // Make the POST request using plain Axios
    const response = await axios.post<CreatePetSuccessResponse>(
      API_ENDPOINTS.CREATE_PET, // Make sure CREATE_PET is defined in apiConfig.ts
      formData,
      {
        headers: headers, // Pass the manually constructed headers
      }
    );

    console.log("Create pet success response:", response);
    return response.data; // Return the data part of the Axios response
  } catch (error) {
    console.error("Create pet API error (FormData):", error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
};

export const getMyListings = async (): Promise<GetPetsResponse> => {
  try{
    console.log("Fetching pet Lists");
    const token = localStorage.getItem("authToken");
        if (!token) throw new Error("User not authenticated.");
    const response = await axios.get<GetPetsResponse>(API_ENDPOINTS.GET_MY_PETS, { headers: { Authorization: token } });
    console.log("Get pet success response:", response);
    return response.data;

  }catch(error){
    console.error("Get pet API error:", error);
    throw error;
  }
}

export const getPetById = async (
  petId: string 
): Promise<GetPetByIdResponse> => {
  try {
    console.log(`Fetching pet details for ID: ${petId}`);
    // Use apiClient if applicable
    const response = await axios.get<GetPetByIdResponse>(
      API_ENDPOINTS.GET_PET_BY_ID.replace(":id", petId));
    console.log("Get pet by ID response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pet ID ${petId}:`, error);
    throw error;
  }
};


export const browseAvailablePets = async (
  page: number = 1,
  limit: number = 12
): Promise<GetBrowsePetsResponse> => {
  try {
    console.log(`Browsing pets - Page: ${page}, Limit: ${limit}`);
    // --- OR plain Axios (ensure API_ENDPOINTS.BROWSE_PETS is defined) ---
        const response = await axios.get<GetBrowsePetsResponse>(
            API_ENDPOINTS.BROWSE_PETS, // e.g., `${API_BASE_URL}/pets`
            { params: { page, limit } }
        );
    console.log("Browse pets response:", response);
    return response.data; // Contains data array and pagination object
  } catch (error) {
    console.error("Error browsing pets:", error);
    throw error;
  }
};

export const deletePetListing = async (
  petId: number | string | BigInt
): Promise<DeletePetResponse> => {
  try {
    const idStr = String(petId);
    console.log(`Requesting DELETE for pet ID: ${idStr}`);

    // --- OR plain Axios ---
    
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("User not authenticated.");
      const response = await axios.delete<DeletePetResponse>(
          API_ENDPOINTS.DELETE_PET.replace(':id', idStr), // Define DELETE_PET endpoint
          { headers: { Authorization: token } }
      );

    console.log("Delete pet response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error deleting pet ${petId}:`, error);
    throw error;
  }
};


