// Define possible values for frontend use, mirroring backend enums

export enum PetGender {
  Male = "Male",
  Female = "Female",
  Unknown = "Unknown",
}
export interface User {
  Id: string | number; 
  name: string; 
  email: string; 
  contactNumber: string;
}

export enum PetSize {
  Small = "Small",
  Medium = "Medium",
  Large = "Large",
}
enum RequestStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Withdrawn = "Withdrawn",
}
export interface PetDocument {
  documentId: string | number; // Use string for BigInt serialization safety
  petId: string | number; // Foreign key
  fileName: string;
  filePath: string; // The relative path/URL saved in the DB
  documentType: DocumentType | null; // Use local enum, allow null
  uploadDate: string; // ISO Date string
  uploadedByUserId: string | number; // Foreign key
}
export enum AdoptionStatus {
  Available = "Available",
  Pending = "Pending",
  Adopted = "Adopted",
  Withdrawn = "Withdrawn",
}
// Define the structure for the form data (useful for useState)
export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: string; // Keep as string from input
  gender: PetGender | ""; // Allow empty string for initial state
  size: PetSize | ""; // Allow empty string
  color: string;
  description: string;
  petImage?: File | null; // Store the file object
}
export interface PetListerInfoManual {
  Id: number; // Or string, if you convert BigInts
  name: string; // Or fullName
}
export interface Pet {
  petId:  string; // Use number or string depending on how BigInt is serialized
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  gender: PetGender; // Use the local enum
  size: PetSize | null; // Use the local enum
  color: string | null;
  description: string | null;
  adoptionStatus: AdoptionStatus; // Use the local enum
  imageUrl: string | null; // This will be the path/URL string from the backend
  dateListed: string; // Dates usually come as ISO strings in JSON
  listedByUserId: number | string; // The foreign key ID
  lister: PetListerInfoManual;
  isVaccinated: boolean;
  isPottyTrained: boolean;
}

 type PetDetailListerInfo = Pick<User, "Id" | "name" | "email" | "contactNumber">;
 type PetListerBasicInfo = Pick<User, "Id" | "name">;
export type PetDetailData = Pet & {
  lister: PetDetailListerInfo;
  // adoptionRequests?: AdoptionRequest[]; // If included
};
export type BrowsePetData = Pet & {
  lister: PetListerBasicInfo;
};
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalPets: number;
  limit: number;
}
export interface GetBrowsePetsResponse {
  data: BrowsePetData[];
  pagination: PaginationInfo;
}
// Helper to get enum values for dropdowns
export const getEnumOptions = <T extends object>(enumObj: T) => {
  return Object.values(enumObj).map((value) => ({ label: value, value }));
};

export const genderOptions = getEnumOptions(PetGender);
export const sizeOptions = getEnumOptions(PetSize);

export type AdoptionRequest = {
  status: RequestStatus;
  petId: string | number;
  messageToLister: string | null;
  requestId: string | number;
  userId: string | number;
  requestDate: Date;
};