import { createAdoptionRequestSchema } from "../validation/petValidation.js";
import { formatError, renderEmailEjs, serializeBigInt } from "../helper.js";
import prisma from "../config/database.js";
import { AdoptionStatus, RequestStatus } from "@prisma/client";
import { emailQueue, emailQueueName } from "../jobs/EmailJob.js";
const clientAppUrl = process.env.CLIENT_APP_URL || "http://localhost:5173";
const browsePetsUrl = `${clientAppUrl}/browse-pets`;
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
        res.status(201).json({
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
    console.log("approveRequests:", req.params);
    const { id } = req.params;
    const listerId = req.user?.id;
    if (!listerId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    const requestId = BigInt(id);
    if (!requestId) {
        res.status(400).json({ message: "Invalid request ID" });
        return;
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            console.log("approveRequests: inside transaction");
            const request = await tx.adoptionRequest.findUnique({
                where: {
                    requestId: requestId,
                },
                include: {
                    pet: { include: { lister: true } }, // Need lister detail of pet
                    requester: true, // Need requester details of pet
                },
            });
            if (!request)
                throw new Error("Request not found."); // Custom error type might be better
            if (request.pet.listedByUserId !== BigInt(listerId))
                throw new Error("Forbidden: Not pet owner.");
            if (request.status !== RequestStatus.Pending)
                throw new Error(`Request is already ${request.status}.`);
            if (request.pet.adoptionStatus !== AdoptionStatus.Available)
                throw new Error(`Pet is not Available (${request.pet.adoptionStatus}).`);
            // 2. update the target request to Approved
            const updatedRequest = await tx.adoptionRequest.update({
                where: { requestId: requestId },
                data: { status: RequestStatus.Approved },
            });
            // 3. Update the Pet status to Adopted
            const updatedPet = await tx.pet.update({
                where: { petId: request.petId },
                data: { adoptionStatus: AdoptionStatus.Adopted },
            });
            // 4. Find all OTHER pending requests for the SAME pet
            const otherRequests = await tx.adoptionRequest.findMany({
                where: {
                    petId: request.petId,
                    status: RequestStatus.Pending,
                    requestId: { not: requestId }, // Exclude the one we just approved
                },
                include: {
                    requester: { select: { Id: true, email: true, name: true } },
                }, // Need other adopters' info
            });
            console.log("approveRequests: otherRequests:", otherRequests);
            // Now reject them
            const rejectedIds = otherRequests.map((r) => r.requestId);
            if (rejectedIds.length > 0) {
                await tx.adoptionRequest.updateMany({
                    where: { requestId: { in: rejectedIds } },
                    data: { status: RequestStatus.Rejected },
                });
            }
            return {
                updatedRequest,
                updatedPet,
                approvedAdopter: request.requester,
                otherRejectedAdopters: otherRequests.map((r) => r.requester),
            };
            // -----Transacton END ------
        });
        // --- 5. Send Notifications & Emails (outside transaction) ---
        const { updatedRequest, updatedPet, approvedAdopter, otherRejectedAdopters, } = result;
        console.log("approveRequests: result:", result);
        // a) Notify Approved Adopter
        await prisma.notification.create({
            data: {
                userId: approvedAdopter.Id,
                notificationType: "ADOPTION_REQUEST_APPROVED",
                message: `Congratulations! Your request for ${updatedPet.name} was approved. Please contact the lister to arrange pickup.`,
                relatedEntityType: "PET",
                relatedEntityId: updatedPet.petId,
            },
        });
        const petDetailUrl = `${clientAppUrl}/pets/manage/${updatedPet.petId}`;
        if (approvedAdopter.email) {
            // Update email template to encourage contact, remove meeting details placeholder
            const body = await renderEmailEjs("request_approved", {
                adopterName: approvedAdopter.name,
                petName: updatedPet.name,
                listerName: req.user?.name,
                petDetailUrl,
            });
            await emailQueue.add(emailQueueName, {
                to: approvedAdopter.email,
                subject: `Your request for ${updatedPet.name} was approved!`,
                body,
            });
        }
        // b) Notify Rejected Adopters
        for (const rejectedAdopter of otherRejectedAdopters) {
            await prisma.notification.create({
                data: {
                    userId: rejectedAdopter.Id,
                    notificationType: "ADOPTION_REQUEST_REJECTED",
                    message: `Sorry, your request for ${updatedPet.name} was rejected.`,
                    relatedEntityType: "PET",
                    relatedEntityId: updatedPet.petId,
                },
            });
            if (rejectedAdopter.email) {
                const body = await renderEmailEjs("pet_adopted_reject", {
                    adopterName: approvedAdopter.name,
                    petName: updatedPet.name,
                    browsePetsUrl
                });
                await emailQueue.add(emailQueueName, {
                    to: rejectedAdopter.email,
                    subject: `Update on your request for ${updatedPet.name}`,
                    body,
                });
            }
        }
        res.status(200).json({
            message: "Request approved.",
            data: serializeBigInt(updatedRequest),
        });
    }
    catch (error) {
        console.error(`Error withdrawing request ${requestId}:`, error);
        if (error.message.includes("Not found") || error.code === "P2025") {
            res.status(404).json({ message: "Request not found." });
            return;
        }
        res
            .status(500)
            .json({ message: "Internal server error withdrawing request." });
        return;
    }
};
export const rejectRequests = async (req, res) => {
    const { id } = req.params;
    const listerId = req.user?.id;
    if (!listerId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    const requestId = BigInt(id);
    if (!requestId) {
        res.status(400).json({ message: "Invalid request ID" });
        return;
    }
    console.log(`Rejecting request ${requestId}`);
    try {
        // Use transaction for consistency, although less critical than approve
        const result = await prisma.$transaction(async (tx) => {
            console.log(`Finding request ${requestId}`);
            // 1. Find request, verify ownership and status
            const request = await tx.adoptionRequest.findUnique({
                where: { requestId: requestId },
                include: {
                    pet: true, // Need pet name/ID
                    requester: true, // Need adopter details
                },
            });
            if (!request)
                throw new Error("Request not found.");
            console.log(`Found request: ${request.requestId}`);
            console.log(`listedByUserId : ${request.pet.listedByUserId}, listerId : ${listerId}`);
            if (request.pet.listedByUserId !== BigInt(listerId)) {
                throw new Error("Forbidden: Not pet owner.");
            }
            if (request.status !== RequestStatus.Pending)
                throw new Error(`Request is already ${request.status}.`);
            // 2. Update request to Rejected
            console.log(`Updating request ${requestId} to Rejected`);
            const updatedRequest = await tx.adoptionRequest.update({
                where: { requestId: requestId },
                data: { status: RequestStatus.Rejected },
            });
            return {
                updatedRequest,
                rejectedAdopter: request.requester,
                pet: request.pet,
            };
        });
        // --- End Transaction ---
        console.log(`Transaction completed`);
        // 3. Send Notifications & Emails
        const { updatedRequest, rejectedAdopter, pet } = result;
        await prisma.notification.create({
            /* ... data for ADOPTION_REQUEST_REJECTED ... */
            data: {
                userId: rejectedAdopter.Id,
                notificationType: "ADOPTION_REQUEST_REJECTED",
                message: `Sorry, your request for ${pet.name} was rejected.`,
                relatedEntityType: "PET",
                relatedEntityId: pet.petId,
            },
        });
        console.log(`Notification created for ${rejectedAdopter.name}`);
        if (rejectedAdopter.email) {
            console.log(`Sending email to ${rejectedAdopter.email}`);
            const body = await renderEmailEjs("request_rejected", {
                adopterName: rejectedAdopter.name,
                petName: pet.name,
                listerName: req.user?.name,
                browsePetsUrl
            });
            await emailQueue.add(emailQueueName, {
                to: rejectedAdopter.email,
                subject: `Update on your request for ${pet.name}`,
                body,
            });
        }
        res
            .status(200)
            .json({ message: "Request rejected.", data: serializeBigInt(updatedRequest) });
        return;
    }
    catch (error) {
        console.error(`Error rejecting request ${requestId}:`, error);
        if (error.message.includes("Not found") || error.code === "P2025") {
            res.status(404).json({ message: "Request not found." });
            return;
        }
        if (error.message.includes("Request is already")) {
            res.status(409).json({ message: error.message });
            return;
        }
        res
            .status(500)
            .json({ message: "Internal server error rejecting request." });
        return;
    }
};
export const withdrawRequest = async (req, res) => {
    const { id } = req.params;
    const adopterUserId = req.user?.id; // Adopter making the request
    if (!adopterUserId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const requestId = BigInt(id);
    if (!requestId) {
        res.status(400).json({ message: "Invalid Request ID" });
        return;
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find request, verify ownership (by adopter) and status
            const request = await tx.adoptionRequest.findUnique({
                where: { requestId: requestId },
                include: { pet: { include: { lister: { select: { Id: true } } } } }, // Need lister ID for notification
            });
            if (!request) {
                throw new Error("Request Not Found");
            }
            if (request.userId !== BigInt(adopterUserId)) {
                throw new Error("This is not the correct user");
            }
            if (request.status !== RequestStatus.Pending)
                throw new Error(`Cannot withdraw a request with status ${request.status}.`);
            // 2. Update request to Withdrawn
            const updatedRequest = await tx.adoptionRequest.update({
                where: { requestId: requestId },
                data: { status: RequestStatus.Withdrawn },
            });
            return { updatedRequest, listerId: request.pet.lister.Id };
        });
        // --- End Transaction ---
        // 3. Send Notification to Lister
        const { updatedRequest, listerId } = result;
        await prisma.notification.create({
            data: {
                userId: listerId,
                notificationType: "ADOPTION_REQUEST_WITHDRAWN",
                message: `An adoption request for one of your pets was withdrawn.`, // Keep it generic or add details
                relatedEntityType: "ADOPTION_REQUEST",
                relatedEntityId: updatedRequest.requestId,
            },
        });
        res
            .status(200)
            .json({ message: "Request withdrawn.", data: serializeBigInt(updatedRequest) });
    }
    catch (error) {
        console.error(`Error withdrawing request ${requestId}:`, error);
        if (error.message.includes("Not found") || error.code === "P2025") {
            res.status(404).json({ message: "Request not found." });
            return;
        }
        if (error.message.includes("Forbidden")) {
            res.status(403).json({ message: "You cannot withdraw this request." });
            return;
        }
        if (error.message.includes("Cannot withdraw")) {
            res.status(409).json({ message: error.message });
            return;
        }
        res
            .status(500)
            .json({ message: "Internal server error withdrawing request." });
        return;
    }
};
