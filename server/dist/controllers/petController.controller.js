import prisma from "../config/database.js";
import { createPetSchema } from "../validation/petValidation.js";
import { formatError, serializeBigInt } from "../helper.js";
import fs from "fs";
import { AdoptionStatus } from "@prisma/client";
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
