import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    // Indexed for fast lookups of all bookings belonging to an event
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "eventId is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: "Invalid email address",
      },
    },
  },
  { timestamps: true }
);

// Mongoose v7+ supports async pre-hooks — throw to abort, no `next` needed
BookingSchema.pre("save", async function () {
  // Guard: only run the existence check when eventId is first set or changed
  if (!this.isModified("eventId")) return;

  const eventExists = await mongoose.models.Event?.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error(`Event with id "${this.eventId}" does not exist`);
  }
});

// Prevent model re-registration during Next.js hot-reloads
const Booking: Model<IBooking> =
  mongoose.models.Booking ?? mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
