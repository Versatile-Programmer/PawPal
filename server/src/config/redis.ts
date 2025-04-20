import {ConnectionOptions, DefaultJobOptions} from 'bullmq';
// * Redisconection requirement
export const redisConnection: ConnectionOptions = {
    host: process.env.REDIS_HOST,
    port: 6379,
}
// * default queue options, how queue behave
export const defaultQueueOptions: DefaultJobOptions = {
    removeOnComplete: {
    count:20,
    age:60 * 60
    },
    attempts:3,
    backoff: {
    type: 'exponential',
    delay: 1000
    },
    removeOnFail:false
}