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

export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return the existing connection if already established
  if (cache.conn) return cache.conn;

  // Reuse an in-flight connection promise to avoid duplicate connections
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false, // Fail fast instead of queuing operations when disconnected
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
