import { createAdoptionRequestSchema } from "../validation/petValidation.js";
import { formatError, renderEmailEjs, serializeBigInt } from "../helper.js";
import prisma from "../config/database.js";
import { AdoptionStatus, RequestStatus } from "@prisma/client";
import { emailQueue, emailQueueName } from "../jobs/EmailJob.js";
export const createAdoptionRequest = async (req, res) => {
    try {
        const adopterId = req.user?.id;
        if (!adopterId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const payload = {
            petId: req.body.petId,
            messageToLister: req.body.messageToLister,
        };
        const validationResult = createAdoptionRequestSchema.safeParse(payload);
        if (!validationResult.success) {
            const errors = formatError(validationResult.error);
            res.status(422).json({ message: "Validation error", errors });
            return;
        }
        const { petId, messageToLister } = validationResult.data;
        const pet = await prisma.pet.findUnique({
            where: { petId: petId },
            include: {
                // Include lister for notifications/emails
                lister: { select: { Id: true, email: true, name: true } },
            },
        });
        if (!pet) {
            res.status(404).json({ message: "Pet not found." });
            return;
        }
        if (pet.adoptionStatus !== AdoptionStatus.Available) {
            res
                .status(409)
                .json({ message: `Sorry, ${pet.name} is no longer available.` }); // 409 Conflict
            return;
        }
        if (pet.listedByUserId === BigInt(adopterId)) {
            res.status(400).json({ message: "You cannot adopt a pet you listed." });
            return;
        }
        const existingRequest = await prisma.adoptionRequest.findFirst({
            where: {
                petId: BigInt(petId),
                userId: BigInt(adopterId),
                status: RequestStatus.Pending,
            },
        });
        if (existingRequest) {
            res.status(409).json({
                message: "You already have a pending request for this pet.",
            });
            return;
        }
        // 4. Create Adoption Request
        const newRequest = await prisma.adoptionRequest.create({
            data: {
                pet: { connect: { petId: petId } },
                requester: { connect: { Id: Number(adopterId) } },
                messageToLister: messageToLister,
                status: RequestStatus.Pending, // Default status
            },
        });
        // --- 5. Notifications & Emails ---
        // Get adopter's details if needed (might be in req.user already)
        const adopterName = req.user?.name || "An interested user"; // Use name from token payload
        await prisma.notification.create({
            data: {
                userId: pet.listedByUserId, // Lister's User ID
                notificationType: "ADOPTION_REQUEST_RECEIVED",
                message: `${adopterName} has requested to adopt ${pet.name}.`,
                relatedEntityType: "ADOPTION_REQUEST",
                relatedEntityId: newRequest.requestId,
            },
        });
        // b) Email Lister (Add to Queue)
        if (pet.lister?.email) {
            const listerEmailBody = await renderEmailEjs("new_adoption_request", {
                listerName: pet.lister.name,
                adopterName: adopterName,
                petName: pet.name,
                // Add a URL to view the request/pet manage page
                requestUrl: `${process.env.CLIENT_APP_URL}/pets/manage/${pet.petId}`, // Or specific request view URL
            });
            await emailQueue.add(emailQueueName, {
                to: pet.lister.email,
                subject: `New Adoption Request for ${pet.name}`,
                body: listerEmailBody,
            });
            console.log(`Lister notification email job added for ${pet.lister.email}`);
        }
        else {
            console.warn(`Lister email missing for user ID ${pet.listedByUserId}`);
        }
        // c) Notify Adopter (In-App Confirmation)
        await prisma.notification.create({
            data: {
                userId: Number(adopterId),
                notificationType: "ADOPTION_REQUEST_SUBMITTED",
                message: `Your adoption request for ${pet.name} has been submitted successfully.`,
                relatedEntityType: "PET",
                relatedEntityId: pet.petId,
            },
        });
        res
            .status(201)
            .json({
            message: "Adoption request submitted successfully!",
            data: serializeBigInt(newRequest),
        });
    }
    catch (error) {
        console.error("Error creating adoption request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getReceivedRequests = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const receivedRequests = await prisma.adoptionRequest.findMany({
            where: {
                pet: {
                    listedByUserId: BigInt(userId),
                },
            },
            include: {
                pet: {
                    select: { petId: true, name: true, imageUrl: true },
                },
                requester: {
                    select: { Id: true, name: true, email: true, contactNumber: true },
                },
            },
            orderBy: {
                requestDate: "asc", // Show newest requests first
            },
        });
        res.status(200).json({ data: serializeBigInt(receivedRequests) });
    }
    catch (error) {
        console.error("Error fetching received adoption requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getSentRequests = async (req, res) => {
    try {
        const requesterUserId = req.user?.id;
        if (!requesterUserId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        // Find requests made by the current user
        const sentRequests = await prisma.adoptionRequest.findMany({
            where: {
                userId: BigInt(requesterUserId), // Filter by the user making the request
            },
            include: {
                pet: {
                    // Include info about the pet requested AND its current status
                    select: {
                        petId: true,
                        name: true,
                        imageUrl: true,
                        adoptionStatus: true, // Include the pet's current status!
                        lister: {
                            // Include basic lister info
                            select: { Id: true, name: true },
                        },
                    },
                },
            },
            orderBy: {
                requestDate: "desc", // Show newest requests first
            },
        });
        res.status(200).json({ data: serializeBigInt(sentRequests) });
    }
    catch (error) {
        console.error("Error fetching sent adoption requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const approveRequests = async (req, res) => {
};
