import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    // Indexed for fast lookups by event; references Event collection
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    // Validated against RFC-5322-compatible regex in the pre-save hook
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

// ─── Pre-save hook ────────────────────────────────────────────────────────────
// Mongoose 9 uses promise-based middleware: throw to abort, return to continue.

BookingSchema.pre("save", async function () {
  // Validate email format before hitting the database
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    throw new Error(`Invalid email address: "${this.email}"`);
  }

  // Ensure the referenced Event exists; reject the booking if it does not
  const eventExists = await mongoose.models.Event.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error(`Event not found for id: "${this.eventId.toString()}"`);
  }
});

// ─── Model ────────────────────────────────────────────────────────────────────

// Guard against model re-registration during Next.js hot-reloads
const Booking: Model<IBooking> =
  mongoose.models.Booking ?? mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
