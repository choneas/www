import { Redis } from '@upstash/redis'

function createRedis(): Redis | null {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        return null
    }
    return Redis.fromEnv()
}

const redis = createRedis()
export default redis
