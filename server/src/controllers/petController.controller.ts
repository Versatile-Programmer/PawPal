import { Request, Response } from "express";
import prisma from "../config/database.js";
import { createPetSchema } from "../validation/petValidation.js";
import { formatError,renderEmailEjs,serializeBigInt } from "../helper.js";
import path from "path";
import fs from "fs";
import { $Enums, AdoptionStatus } from "@prisma/client";
import { RequestStatus } from "@prisma/client";
import { emailQueue, emailQueueName } from "../jobs/EmailJob.js";
import { fileURLToPath } from "url";
export const createPetHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    isVaccinated:
      requestBody.isVaccinated === "true" || requestBody.isVaccinated === true,
    isPottyTrained:
      requestBody.isPottyTrained === "true" ||
      requestBody.isPottyTrained === true,
  };
  const validationResult = createPetSchema.safeParse(dataToValidate);
  console.log("Validation result:", validationResult);

  if (!validationResult.success) {
    if (uploadedFile) {
      fs.unlink(uploadedFile.path, (err) => {
        if (err) console.error("Err deleting orphan:", err);
      });
    }
    const errors = formatError(validationResult.error);
    console.log("Validation errors:", errors);
    res.status(422).json({ message: "Validation error", errors });
    return;
  }
  const validatedPetData = validationResult.data;
  let imagePathToStore: string | undefined = undefined;
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
  } catch (error) {
    console.error("Error creating pet:", error);
    res
      .status(500)
      .json({ message: "Internal server error during database operation" });
  }
};

export const getMyListedPets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try{
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const pets = await prisma.pet.findMany({
        where: {
          listedByUserId: BigInt(userId),
        },
        orderBy:{
          dateListed:"desc"
        },
      //   include: {
      //     _count:{
      //       select:{adoptionRequests:true}
      //   }
      // },
      });
      res.status(200).json({ data: serializeBigInt(pets) });
      return;
  }catch(error){
    console.error("error fetching in your pet list",error);
    res.status(500).json({message:"Internal server error during fetching your pet list"})
    return;
  }
}

export const getPetById = async (req: Request, res: Response): Promise<void> => {

      try {
        const { id } = req.params;
         if (isNaN(Number(id))) {
           res.status(400).json({ message: "Invalid ID format" });
           return;
         }
        const petId = BigInt(id);
        console.log("starting to fetch pet by ID:", petId);
        const pet = await prisma.pet.findUnique({
          where:{
            petId:petId
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
        })
        if(!pet){
          res.status(404).json({message:"Pet not found in database"})
          return;
        }
        res.status(200).json({data:serializeBigInt(pet)})
        return
      } catch (error) {
        console.log("Error fetching pet by ID:", error);
        res.status(500).json({ message: "Internal server error during fetching details of pet" });
      }

}

export const getAllAvailablePets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // --- Pagination  ---
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12; // Default 12 pets per page
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
  } catch (error) {
    console.error("Error fetching available pets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePet = async (req: Request, res: Response): Promise<void> => {
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
    const result:any = await prisma.$transaction(async (tx) => {
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
        return;// Custom error or specific handling
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
      const imagePath = path.join(
        __dirname,
        "../../public",
        result.petImageUrl
      ); // Assumes imageUrl starts with /uploads/...
      console.log(`Attempting to delete image file: ${imagePath}`);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          // Ignore error if file already not found
          console.error(`Error deleting pet image ${imagePath}:`, err);
        } else if (!err) {
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
        } catch (emailError) {
          console.error(
            `Failed to queue deletion notification email for ${requester.email}:`,
            emailError
          );
        }
      }
    }

    // 6. Send Success Response to Lister
    res
      .status(200)
      .json({
        message: `Listing for "${result.petName}" deleted successfully.`,
      });
  } catch (error: any) {
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





