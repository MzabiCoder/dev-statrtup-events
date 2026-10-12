import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

/**
 * Cached connection stored on the global object to survive Next.js
 * hot-reloads in development without opening a new connection each time.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the Node.js global type to hold our cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

/**
 * Connects to MongoDB using MONGODB_URI, reusing a cached connection or an
 * in-flight connection attempt. Failed attempts are cleared to allow retries.
 *
 * @returns The connected Mongoose instance.
 * @throws The connection error if the attempt fails.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return the existing connection if already established
  if (cache.conn) return cache.conn;

  // Reuse an in-flight connection promise to avoid duplicate connections
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false, // Fail fast instead of queuing operations when disconnected
    });
  }

  const connectionPromise = cache.promise;
  try {
    cache.conn = await connectionPromise;
  } catch (error) {
    // A failed waiter must not clear a newer connection attempt.
    if (cache.promise === connectionPromise) cache.promise = null;
    throw error;
  }
  return cache.conn;
}
