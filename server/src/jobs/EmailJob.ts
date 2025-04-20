import {Job, Queue,Worker} from 'bullmq';
import { defaultQueueOptions, redisConnection } from '../config/redis.js';
import { sendEmail } from '../config/mail.js';
// * queue name so that we can able to create such workers which handle emailQueue works.
export const emailQueueName = "emailQueue";
// * creating a queue instance

export const emailQueue = new Queue(emailQueueName,{
    connection:redisConnection,
    defaultJobOptions:defaultQueueOptions
});
// * dataType for email
/**
 * This file contains the bull queue configuration for sending emails.
 * The queue is stored in Redis, which is a fast in-memory data storage system.
 * The queue is used to send emails asynchronously, meaning that the server does not need to wait for the email to be sent before responding to the user.
 * The email is sent in the background, and the user is given a response immediately.
 * The email is sent using the nodemailer library, which is a popular library for sending emails in Node.js
 * 
 * The queue is configured with the following options:
 * - The queue is stored in Redis
 * - The queue is given the name "emailQueue"
 * - The queue is configured to remove jobs from the queue after they have been completed successfully
 * - The queue is configured to wait 1 second before retrying a failed job
 * - The queue is configured to remove jobs from the queue after they have been failed 3 times
 * 
 * The worker is configured to process jobs from the queue in the background.
 * The worker is given the name "emailWorker"
 * The worker is configured to process jobs as soon as they are added to the queue
 * The worker is configured to process jobs one at a time
 * The worker is configured to remove jobs from the queue after they have been completed successfully
 * 
 * The email is sent using the sendEmail function, which is imported from the mail.js file.
 * The sendEmail function takes in the to, subject, and body of the email as arguments.
 */
interface EmailJobDataType {
    /**
     * The email address of the recipient
     */
    to:string,
    /**
     * The subject of the email
     */
    subject:string,
    /**
     * The body of the email
     */
    body:string
}
// * creating a worker instance 

export const queueWorker = new Worker(emailQueueName,async(job:Job)=>{
    const data:EmailJobDataType = job.data;
    await sendEmail(data.to,data.subject,data.body);
},
{
    connection:redisConnection
});

