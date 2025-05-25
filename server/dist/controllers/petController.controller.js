import prisma from "../config/database.js";
import { createPetSchema } from "../validation/petValidation.js";
import { formatError, renderEmailEjs, serializeBigInt } from "../helper.js";
import path from "path";
import fs from "fs";
import { AdoptionStatus } from "@prisma/client";
import { RequestStatus } from "@prisma/client";
import { emailQueue, emailQueueName } from "../jobs/EmailJob.js";
import { fileURLToPath } from "url";
export const createPetHandler = async (req, res) => {
    console.log("Inside createPetHandler");
    const userId = req.user?.id;
    if (!userId) {
        // If a file was uploaded before auth check failed (unlikely with current middleware order, but safe)
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                // Use async unlink
                if (err)
                    console.error(`Error deleting orphaned file ${req.file?.path}:`, err);
            });
        }
        console.log("User not authenticated, returning 401");
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    const uploadedFile = req.file;
    const requestBody = req.body;
    console.log("Received Body:", requestBody);
    console.log("Received File:", uploadedFile);
    // --- Prepare data for validation ---
    // Directly use values from req.body. Zod will validate types.
    // Ensure optional empty strings become null if desired by the schema/DB
    let dataToValidate = {
        name: requestBody.name,
        species: requestBody.species,
        gender: requestBody.gender,
        breed: requestBody.breed || null,
        size: requestBody.size || null,
        color: requestBody.color || null,
        description: requestBody.description || null,
        age: requestBody.age ? Number(requestBody.age) : null, // Convert to number or null
        isVaccinated: requestBody.isVaccinated === "true" || requestBody.isVaccinated === true,
        isPottyTrained: requestBody.isPottyTrained === "true" ||
            requestBody.isPottyTrained === true,
    };
    const validationResult = createPetSchema.safeParse(dataToValidate);
    console.log("Validation result:", validationResult);
    if (!validationResult.success) {
        if (uploadedFile) {
            fs.unlink(uploadedFile.path, (err) => {
                if (err)
                    console.error("Err deleting orphan:", err);
            });
        }
        const errors = formatError(validationResult.error);
        console.log("Validation errors:", errors);
        res.status(422).json({ message: "Validation error", errors });
        return;
    }
    const validatedPetData = validationResult.data;
    let imagePathToStore = undefined;
    if (uploadedFile) {
        imagePathToStore = `/uploads/pets/${uploadedFile.filename}`;
    }
    try {
        console.log("Creating new pet in DB");
        const newPet = await prisma.pet.create({
            data: {
                ...validatedPetData, // Spread validated data
                imageUrl: imagePathToStore,
                lister: { connect: { Id: Number(userId) } },
            },
        });
        console.log("Pet created:", newPet);
        res
            .status(201)
            .json({
            message: "Pet Added Successfully",
            data: serializeBigInt(newPet),
        });
        return;
    }
    catch (error) {
        console.error("Error creating pet:", error);
        res
            .status(500)
            .json({ message: "Internal server error during database operation" });
    }
};
// export const updatePetHandler = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const {id} = req.params; // Pet ID from URL
//   const userId = req.user?.id; // Logged-in user ID
//   if (!id) {
//     res.status(400).json({ message: "pet Id not found" });
//     return;
//   }
//   const petId =req.params.id;
//   console.log(
//     `[Update Pet ID: ${id}] Received update request by User ID: ${userId}`
//   );
//   console.log("The user id is ", userId);
//   if (!userId) {
//     // If a file was uploaded before auth check failed
//     if (req.file) {
//       fs.unlink(req.file.path, (err) => {
//         if (err)
//           console.error(`Error deleting temp file ${req.file?.path}:`, err);
//       });
//     }
//     console.log(`[Update Pet ID: ${id}] User not authenticated`);
//     res.status(401).json({ message: "User not authenticated" });
//     return;
//   }
//   // let petId: bigint;
//   // try {
//   //   petId = BigInt(req.params.id);
//   // } catch (e) {
//   //   if (req.file) {
//   //     fs.unlink(req.file.path, (err) => {
//   //       if (err)
//   //         console.error(`Error deleting temp file ${req.file?.path}:`, err);
//   //     });
//   //   }
//   //   console.log(`[Update Pet ID: ${id}] Invalid Pet ID format`);
//   //   res.status(400).json({ message: "Invalid Pet ID format." });
//   //   return;
//   // }
//   const uploadedFile = req.file;
//   const requestBody = req.body;
//   console.log(`[Update Pet ID: ${petId}] Received Body:`, requestBody);
//   console.log(`[Update Pet ID: ${petId}] Received File:`, uploadedFile);
//   try {
//     // 1. Fetch the existing pet to check ownership and get old image URL
//     const existingPet = await prisma.pet.findUnique({
//       where: { petId: BigInt(petId) },
//     });
//     if (!existingPet) {
//       if (uploadedFile) {
//         fs.unlink(uploadedFile.path, (err) => {
//           if (err) console.error("Err deleting temp file:", err);
//         });
//       }
//       console.log(`[Update Pet ID: ${petId}] Pet not found`);
//       res.status(404).json({ message: "Pet not found." });
//       return;
//     }
//     if (existingPet.listedByUserId !== BigInt(userId)) {
//       // Compare with BigInt if userId in DB is BigInt
//       if (uploadedFile) {
//         fs.unlink(uploadedFile.path, (err) => {
//           if (err) console.error("Err deleting temp file:", err);
//         });
//       }
//       console.log(
//         `[Update Pet ID: ${petId}] User ${userId} not authorized to update pet owned by ${existingPet.listedByUserId}`
//       );
//       res
//         .status(403)
//         .json({ message: "You are not authorized to update this pet." });
//       return;
//     }
//     // 2. Prepare data for validation and update
//     // Only include fields that are present in the requestBody
//     // For booleans, handle string 'true'/'false' from FormData
//     const dataToUpdate: Record<string, any> = {};
//     const potentialFields = [
//       "name",
//       "species",
//       "breed",
//       "age",
//       "gender",
//       "size",
//       "color",
//       "description",
//       "isVaccinated",
//       "isPottyTrained",
//     ];
//     potentialFields.forEach((field) => {
//       if (requestBody.hasOwnProperty(field)) {
//         if (field === "isVaccinated" || field === "isPottyTrained") {
//           dataToUpdate[field] =
//             requestBody[field] === "true" || requestBody[field] === true;
//         } else if (field === "age" && requestBody.age) {
//           const parsedAge = parseInt(requestBody.age, 10);
//           if (!isNaN(parsedAge)) dataToUpdate.age = parsedAge;
//           // If age is an empty string from form, it might not be in requestBody or be ""
//           // If it's "", Number("") is 0, so it's fine if 0 is allowed. Otherwise, handle empty string explicitly.
//           else if (requestBody.age === "") dataToUpdate.age = null; // Explicitly set to null if empty
//         } else if (
//           requestBody[field] === "" &&
//           (field === "breed" ||
//             field === "size" ||
//             field === "color" ||
//             field === "description")
//         ) {
//           // For optional text fields, an empty string means clear it (set to null)
//           dataToUpdate[field] = null;
//         } else {
//           dataToUpdate[field] = requestBody[field];
//         }
//       }
//     });
//     // Use .partial() to make all fields in the schema optional for validation
//     const updateSchema = createPetSchema.partial();
//     const validationResult = updateSchema.safeParse(dataToUpdate);
//     if (!validationResult.success) {
//       if (uploadedFile) {
//         fs.unlink(uploadedFile.path, (err) => {
//           if (err) console.error("Err deleting temp file:", err);
//         });
//       }
//       const errors = formatError(validationResult.error);
//       console.log(`[Update Pet ID: ${petId}] Validation errors:`, errors);
//       res.status(422).json({ message: "Validation error", errors });
//       return;
//     }
//     const validatedUpdateData = validationResult.data;
//     // 3. Handle Image Update
//     let newImagePathToStore: string | undefined | null = undefined; // undefined = no change, null = remove image
//     if (uploadedFile) {
//       newImagePathToStore = `/uploads/pets/${uploadedFile.filename}`;
//     }
//     // If frontend sends a specific signal to remove image (e.g., removeImage: 'true')
//     // else if (requestBody.removeImage === 'true') {
//     //     validatedUpdateData.imageUrl = null; // Set to null to remove
//     // }
//     // 4. Update Pet in Database
//     console.log(
//       `[Update Pet ID: ${petId}] Updating pet in DB with data:`,
//       validatedUpdateData
//     );
//     const updatedPet = await prisma.pet.update({
//       where: { petId: BigInt(petId) },
//       data: {...validatedUpdateData,
//         imageUrl: newImagePathToStore}, // Prisma update only acts on fields present in validatedUpdateData
//     });
//     console.log(
//       `[Update Pet ID: ${petId}] Pet updated successfully:`,
//       updatedPet
//     );
//     // 5. Delete old image if a new one was uploaded (and old one existed)
//     if (
//       uploadedFile &&
//       existingPet.imageUrl &&
//       existingPet.imageUrl !== newImagePathToStore
//     ) {
//       const __filename_old = fileURLToPath(import.meta.url);
//       const __dirname_old = path.dirname(__filename_old);
//       const oldImagePath = path.join(
//         __dirname_old,
//         "../../public",
//         existingPet.imageUrl
//       );
//       console.log(
//         `[Update Pet ID: ${petId}] Deleting old image: ${oldImagePath}`
//       );
//       fs.unlink(oldImagePath, (err) => {
//         if (err && err.code !== "ENOENT")
//           console.error(`Error deleting old image ${oldImagePath}:`, err);
//         else if (!err)
//           console.log(`Successfully deleted old image: ${oldImagePath}`);
//       });
//     }
//     // Also handle if removeImage was true and existingPet.imageUrl existed
//     res
//       .status(200)
//       .json({
//         message: "Pet details updated successfully",
//         data: serializeBigInt(updatedPet),
//       });
//   } catch (error: any) {
//     if (uploadedFile) {
//       fs.unlink(uploadedFile.path, (err) => {
//         if (err) console.error("Err deleting temp file on catch:", err);
//       });
//     }
//     console.error(`[Update Pet ID: ${id}] Error updating pet:`, error);
//     res
//       .status(500)
//       .json({ message: "Internal server error during pet update." });
//   }
// };
export const updatePetHandler = async (req, res) => {
    const petIdStringFromParams = req.params.id;
    const userIdFromAuth = req.user?.id;
    // 1. Initial Validations
    if (!petIdStringFromParams) {
        res.status(400).json({ message: "Pet ID parameter not found in URL." });
        return;
    }
    console.log(`[Update Pet by Param: ${petIdStringFromParams}] Received update request. User ID from auth: ${userIdFromAuth}`);
    if (!userIdFromAuth) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err)
                    console.error(`Error deleting temp file ${req.file?.path} (user not authenticated):`, err);
            });
        }
        console.log(`[Update Pet by Param: ${petIdStringFromParams}] User not authenticated.`);
        res.status(401).json({ message: "User not authenticated." });
        return;
    }
    // 2. Parse IDs to BigInt
    let petId;
    let authenticatedUserId;
    try {
        petId = BigInt(petIdStringFromParams);
    }
    catch (e) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err)
                    console.error(`Error deleting temp file ${req.file?.path} (invalid petId):`, err);
            });
        }
        console.log(`[Update Pet by Param: ${petIdStringFromParams}] Invalid Pet ID format. Input was: "${petIdStringFromParams}"`);
        res
            .status(400)
            .json({
            message: `Invalid Pet ID format. Received: "${petIdStringFromParams}"`,
        });
        return;
    }
    try {
        authenticatedUserId = BigInt(userIdFromAuth);
    }
    catch (e) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err)
                    console.error(`Error deleting temp file ${req.file?.path} (invalid userId):`, err);
            });
        }
        console.error(`[Update Pet ID: ${petId}] Invalid User ID format for authenticated user: ${userIdFromAuth}`);
        res
            .status(500)
            .json({ message: "Internal server error: Invalid user ID format." });
        return;
    }
    const uploadedFile = req.file;
    const requestBody = req.body; // From FormData, likely [Object: null prototype]
    console.log(`[Update Pet ID: ${petId}] Received Body:`, requestBody);
    console.log(`[Update Pet ID: ${petId}] Received File:`, uploadedFile);
    try {
        // 3. Fetch existing pet
        const existingPet = await prisma.pet.findUnique({ where: { petId } });
        if (!existingPet) {
            if (uploadedFile) {
                fs.unlink(uploadedFile.path, (err) => {
                    if (err)
                        console.error("Error deleting temp file (pet not found):", err);
                });
            }
            console.log(`[Update Pet ID: ${petId}] Pet not found in database.`);
            res.status(404).json({ message: "Pet not found." });
            return;
        }
        // 4. Authorization Check
        if (existingPet.listedByUserId !== authenticatedUserId) {
            if (uploadedFile) {
                fs.unlink(uploadedFile.path, (err) => {
                    if (err)
                        console.error("Error deleting temp file (unauthorized):", err);
                });
            }
            console.log(`[Update Pet ID: ${petId}] User ${authenticatedUserId} not authorized. Pet owned by ${existingPet.listedByUserId}.`);
            res
                .status(403)
                .json({ message: "You are not authorized to update this pet." });
            return;
        }
        // 5. Prepare dataToUpdate for Zod validation (excluding imageUrl initially)
        const dataToUpdate = {};
        const potentialFields = [
            "name",
            "species",
            "breed",
            "age",
            "gender",
            "size",
            "color",
            "description",
            "isVaccinated",
            "isPottyTrained",
        ];
        potentialFields.forEach((field) => {
            if (field in requestBody) {
                // Use 'in' operator for [Object: null prototype]
                const value = requestBody[field];
                if (field === "isVaccinated" || field === "isPottyTrained") {
                    dataToUpdate[field] = value === "true" || value === true;
                }
                else if (field === "age") {
                    if (value === "" || value === null || value === undefined) {
                        dataToUpdate.age = null;
                    }
                    else {
                        const parsedAge = parseInt(value, 10);
                        dataToUpdate.age = !isNaN(parsedAge) ? parsedAge : value; // Pass original to Zod if parsing fails
                    }
                }
                else if (value === "" &&
                    ["breed", "size", "color", "description"].includes(field)) {
                    dataToUpdate[field] = null;
                }
                else if (value !== undefined) {
                    dataToUpdate[field] = value;
                }
            }
        });
        // 6. Validate data using Zod
        const updateSchema = createPetSchema.partial();
        const validationResult = updateSchema.safeParse(dataToUpdate);
        if (!validationResult.success) {
            if (uploadedFile) {
                fs.unlink(uploadedFile.path, (err) => {
                    if (err)
                        console.error("Error deleting temp file (validation failed):", err);
                });
            }
            const errors = formatError(validationResult.error);
            console.log(`[Update Pet ID: ${petId}] Validation errors:`, errors);
            res.status(422).json({ message: "Validation error", errors });
            return;
        }
        const validatedUpdateData = validationResult.data; // Does NOT contain imageUrl at this stage
        // 7. Determine new imageUrl based on file upload or removal flag
        let newImagePathToStoreInDb = undefined;
        // undefined: no change intended for the image
        // null: image should be removed (set to null in DB)
        // string: path to the new image
        if (uploadedFile) {
            newImagePathToStoreInDb = `/uploads/pets/${uploadedFile.filename}`;
            console.log(`[Update Pet ID: ${petId}] New image uploaded: ${newImagePathToStoreInDb}`);
        }
        else if (requestBody.removeImage === "true" ||
            requestBody.removeImage === true) {
            newImagePathToStoreInDb = null; // Signal to remove the image
            console.log(`[Update Pet ID: ${petId}] Image flagged for removal.`);
        }
        else {
            console.log(`[Update Pet ID: ${petId}] No new image uploaded and no removal flag.`);
            // newImagePathToStoreInDb remains undefined, meaning no change to existing imageUrl
        }
        // 8. Construct the final data object for Prisma update
        const dataForPrismaUpdate = { ...validatedUpdateData };
        if (newImagePathToStoreInDb !== undefined) {
            // If newImagePathToStoreInDb is a string (new path) or null (remove),
            // then assign it to imageUrl in the data for Prisma.
            // If it's undefined, imageUrl property won't be added here,
            // and Prisma won't touch the existing imageUrl.
            dataForPrismaUpdate.imageUrl = newImagePathToStoreInDb;
        }
        console.log(`[Update Pet ID: ${petId}] Updating pet in DB with data:`, JSON.stringify(dataForPrismaUpdate, null, 2)); // Log the data being sent to Prisma
        // Check if there's anything to update. If dataForPrismaUpdate is empty (and imageUrl wasn't changed),
        // Prisma might throw an error or do nothing. Usually, some field is being updated.
        if (Object.keys(dataForPrismaUpdate).length === 0) {
            console.log(`[Update Pet ID: ${petId}] No data fields to update.`);
            // Optionally, you could return a message here if no actual data changes were submitted.
            // For now, we let Prisma handle it (it might update `updatedAt` if defined with @updatedAt).
        }
        const updatedPet = await prisma.pet.update({
            where: { petId },
            data: dataForPrismaUpdate,
        });
        console.log(`[Update Pet ID: ${petId}] Pet updated successfully in DB:`, updatedPet);
        // 9. Delete old image from filesystem if necessary
        const oldImageShouldBeDeleted = (newImagePathToStoreInDb && // A new image path was set (string)
            existingPet.imageUrl && // An old image URL existed
            existingPet.imageUrl !== newImagePathToStoreInDb) || // And it's different
            (newImagePathToStoreInDb === null && existingPet.imageUrl); // Or image was explicitly marked for removal and an old one existed
        if (oldImageShouldBeDeleted && existingPet.imageUrl) {
            let baseDir = typeof __dirname !== "undefined"
                ? __dirname
                : path.dirname(fileURLToPath(import.meta.url));
            const oldImageAbsolutePath = path.join(baseDir, "../../public", existingPet.imageUrl); // Adjust ../../public as needed
            console.log(`[Update Pet ID: ${petId}] Attempting to delete old image: ${oldImageAbsolutePath}`);
            fs.unlink(oldImageAbsolutePath, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error(`Error deleting old image ${oldImageAbsolutePath}:`, err);
                }
                else if (!err) {
                    console.log(`Successfully deleted old image: ${oldImageAbsolutePath}`);
                }
                else if (err?.code === "ENOENT") {
                    console.log(`Old image not found (ENOENT), presumed already deleted: ${oldImageAbsolutePath}`);
                }
            });
        }
        res.status(200).json({
            message: "Pet details updated successfully",
            data: serializeBigInt(updatedPet),
        });
    }
    catch (error) {
        if (uploadedFile) {
            fs.unlink(uploadedFile.path, (err) => {
                if (err)
                    console.error("Error deleting temp file on general catch:", err);
            });
        }
        const idContextForLog = typeof petId === "bigint" ? petId.toString() : petIdStringFromParams;
        console.error(`[Update Pet (ID Context: ${idContextForLog})] Unhandled error during update:`, error);
        res
            .status(500)
            .json({ message: "Internal server error during pet update." });
    }
};
export const getMyListedPets = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const pets = await prisma.pet.findMany({
            where: {
                listedByUserId: BigInt(userId),
            },
            orderBy: {
                dateListed: "desc"
            },
            //   include: {
            //     _count:{
            //       select:{adoptionRequests:true}
            //   }
            // },
        });
        res.status(200).json({ data: serializeBigInt(pets) });
        return;
    }
    catch (error) {
        console.error("error fetching in your pet list", error);
        res.status(500).json({ message: "Internal server error during fetching your pet list" });
        return;
    }
};
export const getPetById = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(Number(id))) {
            res.status(400).json({ message: "Invalid ID format" });
            return;
        }
        const petId = BigInt(id);
        console.log("starting to fetch pet by ID:", petId);
        const pet = await prisma.pet.findUnique({
            where: {
                petId: petId
            },
            include: {
                lister: {
                    select: {
                        Id: true,
                        name: true,
                        email: true,
                        contactNumber: true
                    },
                }
            }
        });
        if (!pet) {
            res.status(404).json({ message: "Pet not found in database" });
            return;
        }
        res.status(200).json({ data: serializeBigInt(pet) });
        return;
    }
    catch (error) {
        console.log("Error fetching pet by ID:", error);
        res.status(500).json({ message: "Internal server error during fetching details of pet" });
    }
};
export const getAllAvailablePets = async (req, res) => {
    try {
        // --- Pagination  ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12; // Default 12 pets per page
        const skip = (page - 1) * limit;
        // --- Query ---
        const pets = await prisma.pet.findMany({
            where: {
                adoptionStatus: AdoptionStatus.Available, // Only show available pets
                // TODO: Add filtering based on query params (species, breed, location etc.) later
            },
            orderBy: {
                dateListed: "desc", // Newest first
            },
            skip: skip,
            take: limit,
            include: {
                // Include basic lister info for display
                lister: {
                    select: { name: true, Id: true }, // Only non-sensitive info
                },
            },
        });
        // --- Get Total Count for Pagination ---
        const totalPets = await prisma.pet.count({
            where: {
                adoptionStatus: AdoptionStatus.Available,
                // TODO: Add same filtering here
            },
        });
        const totalPages = Math.ceil(totalPets / limit);
        // --- Response ---
        res.status(200).json({
            data: serializeBigInt(pets),
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalPets: totalPets,
                limit: limit,
            },
        });
    }
    catch (error) {
        console.error("Error fetching available pets:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const deletePet = async (req, res) => {
    const { id } = req.params;
    const listerUserId = req.user?.id; // From authenticateToken
    if (!listerUserId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    const petId = parseInt(id, 10);
    if (isNaN(petId)) {
        res.status(400).json({ message: "Invalid Pet ID format." });
        return;
    }
    try {
        // --- Use Transaction for safety ---
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find the Pet and verify ownership
            const pet = await tx.pet.findUnique({
                where: { petId: petId },
                select: {
                    // Select only necessary fields
                    listedByUserId: true,
                    imageUrl: true,
                    name: true, // Needed for notifications
                },
            });
            if (!pet) {
                res.status(400).json({ message: "Pet not found" });
                return; // Custom error or specific handling
            }
            if (pet.listedByUserId !== BigInt(listerUserId)) {
                throw new Error("Forbidden"); // Custom error or specific handling
            }
            // 2. Find users with PENDING requests for this pet BEFORE deleting
            const pendingRequests = await tx.adoptionRequest.findMany({
                where: {
                    petId: petId,
                    status: RequestStatus.Pending,
                },
                include: {
                    // Include requester info for notifications
                    requester: { select: { Id: true, email: true, name: true } },
                },
            });
            // 3. Permanently delete the pet record
            // NOTE: If you have `onDelete: Cascade` on AdoptionRequest's relation to Pet,
            // the requests will be deleted automatically by the database here.
            // If not using Cascade, you'd need to delete requests manually:
            // await tx.adoptionRequest.deleteMany({ where: { petId: petId } });
            await tx.pet.delete({
                where: { petId: petId },
            });
            // Return pet info needed for file deletion and notifications
            return {
                petImageUrl: pet.imageUrl,
                petName: pet.name,
                pendingRequesters: pendingRequests.map((r) => r.requester),
            };
        });
        // --- End Transaction ---
        // --- 4. Delete Associated Image File (Outside Transaction) ---
        if (result?.petImageUrl) {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            // Path relative to this controller file's compiled location (dist/controllers)
            const imagePath = path.join(__dirname, "../../public", result.petImageUrl); // Assumes imageUrl starts with /uploads/...
            console.log(`Attempting to delete image file: ${imagePath}`);
            fs.unlink(imagePath, (err) => {
                if (err && err.code !== "ENOENT") {
                    // Ignore error if file already not found
                    console.error(`Error deleting pet image ${imagePath}:`, err);
                }
                else if (!err) {
                    console.log(`Successfully deleted pet image: ${imagePath}`);
                }
            });
        }
        // --- 5. Notify Pending Requesters (Outside Transaction) ---
        for (const requester of result.pendingRequesters) {
            // a) In-App Notification
            await prisma.notification.create({
                data: {
                    userId: requester.Id,
                    notificationType: "PET_LISTING_DELETED", // Use a specific type
                    message: `The listing for "${result.petName}", which you requested, has been removed by the lister.`,
                    // No related entity needed as the pet/request might be gone
                },
            });
            // b) Email Notification
            if (requester.email) {
                try {
                    const emailBody = await renderEmailEjs("listing_deleted", {
                        adopterName: requester.name,
                        petName: result.petName,
                    });
                    await emailQueue.add(emailQueueName, {
                        to: requester.email,
                        subject: `Update regarding your request for ${result.petName}`,
                        body: emailBody,
                    });
                }
                catch (emailError) {
                    console.error(`Failed to queue deletion notification email for ${requester.email}:`, emailError);
                }
            }
        }
        // 6. Send Success Response to Lister
        res
            .status(200)
            .json({
            message: `Listing for "${result.petName}" deleted successfully.`,
        });
    }
    catch (error) {
        console.error(`Error deleting pet ${petId}:`, error);
        if (error.message === "NotFound" || error.code === "P2025") {
            // P2025 = Record to delete does not exist
            res.status(404).json({ message: "Pet listing not found." });
            return;
        }
        if (error.message === "Forbidden") {
            res
                .status(403)
                .json({ message: "You are not authorized to delete this listing." });
            return;
        }
        // Handle other potential Prisma or filesystem errors
        res
            .status(500)
            .json({ message: "Internal server error deleting pet listing." });
    }
};
