import { Queue, Worker } from 'bullmq';
import { defaultQueueOptions, redisConnection } from '../config/redis.js';
import { sendEmail } from '../config/mail.js';
// * queue name so that we can able to create such workers which handle emailQueue works.
export const emailQueueName = "emailQueue";
// * creating a queue instance
export const emailQueue = new Queue(emailQueueName, {
    connection: redisConnection,
    defaultJobOptions: defaultQueueOptions
});
// * creating a worker instance 
export const queueWorker = new Worker(emailQueueName, async (job) => {
    const data = job.data;
    await sendEmail(data.to, data.subject, data.body);
}, {
    connection: redisConnection
});
