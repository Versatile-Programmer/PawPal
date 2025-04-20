// Basic configuration for API endpoints

const API_BASE_URL = "http://localhost:5005"; // !! Replace with your backend URL and port !!

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  CREATE_PET: `${API_BASE_URL}/api/pets/list`,
  GET_MY_PETS: `${API_BASE_URL}/api/pets/my-listings`,
  GET_PET_BY_ID: `${API_BASE_URL}/api/pets/view/:id`,
  BROWSE_PETS: `${API_BASE_URL}/api/pets/all`,
  SUBMIT_REQUEST: `${API_BASE_URL}/api/requests/create`,
};
