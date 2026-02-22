import Redis from 'ioredis'

const globalForRedis = global as unknown as { redis: Redis | undefined }

let redisInstance: Redis | undefined
let connectionPromise: Promise<void> | undefined

function getRedis(): Redis {
  if (redisInstance) {
    return redisInstance
  }

  if (globalForRedis.redis) {
    redisInstance = globalForRedis.redis
    return redisInstance
  }

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    console.error('REDIS_URL environment variable is not set')
    throw new Error('REDIS_URL environment variable is required')
  }

  const newRedis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    commandTimeout: 5000,
    retryStrategy(times) {
      if (times > 3) {
        console.error(`Redis retry limit reached after ${times} attempts`)
        return null
      }
      const delay = Math.min(times * 50, 2000)
      console.log(`Redis retry attempt ${times}, waiting ${delay}ms`)
      return delay
    },
    reconnectOnError(err) {
      console.error('Redis reconnect on error:', err.message)
      return true
    }
  })

  newRedis.on('connect', () => {
    console.log('Redis: Connected')
  })

  newRedis.on('ready', () => {
    console.log('Redis: Ready')
  })

  newRedis.on('error', (err) => {
    console.error('Redis error:', err.message)
  })

  newRedis.on('close', () => {
    console.log('Redis: Connection closed')
  })

  newRedis.on('reconnecting', () => {
    console.log('Redis: Reconnecting...')
  })

  connectionPromise = newRedis.connect().catch(err => {
    console.error('Redis initial connection error:', err)
    throw err
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = newRedis
  }

  redisInstance = newRedis
  return redisInstance
}

export async function ensureRedisConnection(): Promise<void> {
  const instance = getRedis()

  if (connectionPromise) {
    await connectionPromise
  }

  try {
    await instance.ping()
    return
  } catch {
    console.log('Redis ping failed, attempting to reconnect...')
  }

  if (instance.status === 'end' || instance.status === 'close') {
    await instance.connect()
  }

  try {
    await instance.ping()
  } catch (err) {
    throw new Error(`Redis connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

// Export a Proxy that lazily initializes Redis
export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    const instance = getRedis()
    const value = instance[prop as keyof Redis]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
})
