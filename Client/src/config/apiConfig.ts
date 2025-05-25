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
  GET_RECEIVED_REQUESTS: `${API_BASE_URL}/api/requests/received`,
  GET_SENT_REQUESTS: `${API_BASE_URL}/api/requests/sent`,
  APPROVE_REQUEST: `${API_BASE_URL}/api/requests/:id/approve`,
  REJECT_REQUEST: `${API_BASE_URL}/api/requests/:id/reject`,
  WITHDRAW_REQUEST: `${API_BASE_URL}/api/requests/:id/withdraw`,
  DELETE_PET: `${API_BASE_URL}/api/pets/delete/:id`,
  GET_NOTIFICATIONS: `${API_BASE_URL}/api/notifications/get`,
  MARK_NOTIFICATION_READ: `${API_BASE_URL}/api/notifications/:notificationId/read`,
  MARK_ALL_NOTIFICATIONS_READ: `${API_BASE_URL}/api/notifications/all/read`,
  UPDATE_MY_PETS: `${API_BASE_URL}/api/pets/update/:id`,
};
