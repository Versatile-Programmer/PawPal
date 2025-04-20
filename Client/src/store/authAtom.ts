import { atom } from "recoil";

// Helper function to get the initial token value safely
const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem("authToken");
  } catch (e) {
    // Handle potential SecurityError in restricted environments (like sandboxed iframes)
    console.error("Could not access localStorage:", e);
    return null;
  }
};

const getUserData = (): string | null => {
  try {
    const data = localStorage.getItem("userData");
    return data ? data : null;
  } catch (e) {
    console.error("Could not access localStorage:", e);
    return null;
  }
};


/**
 * Recoil Atom representing the authentication token.
 * Reads the initial value directly from localStorage.
 * Holds the token string if logged in, or null if logged out.
 */
export const authTokenState = atom<string | null>({
  key: "authTokenState", // Unique ID
  default: getInitialToken(), // Initialize directly from localStorage
});

// Optional: You might still want an atom for user details if needed elsewhere,
// but it wouldn't be directly tied to localStorage persistence here.

export interface AuthUser { id: number; name: string; email: string; }
export const currentUserState = atom<AuthUser | null>({
  key: "currentUserState",
  default: (() => {
    const data = getUserData();
    return data ? JSON.parse(data) : null;
  })(),
});

