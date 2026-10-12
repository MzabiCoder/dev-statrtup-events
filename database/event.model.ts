import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    // Populated automatically in the pre-save hook — not submitted by the client
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    overview: { type: String, required: [true, "Overview is required"], trim: true },
    image: { type: String, required: [true, "Image URL is required"], trim: true },
    venue: { type: String, required: [true, "Venue is required"], trim: true },
    location: { type: String, required: [true, "Location is required"], trim: true },
    date: { type: String, required: [true, "Date is required"] },
    time: { type: String, required: [true, "Time is required"] },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
    },
    audience: { type: String, required: [true, "Audience is required"], trim: true },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: { type: String, required: [true, "Organizer is required"], trim: true },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  { timestamps: true }
);

// Mongoose v7+ supports async pre-hooks — throw to abort, no `next` needed
EventSchema.pre("save", async function () {
  // Regenerate slug only when title changes to avoid unnecessary writes
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")   // strip special chars
      .replace(/[\s_]+/g, "-")     // spaces/underscores → hyphens
      .replace(/^-+|-+$/g, "");    // trim leading/trailing hyphens
  }

  if (this.isModified("date")) {
    // Normalise to ISO date string (YYYY-MM-DD); reject unparseable values
    const parsed = new Date(this.date);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date value: "${this.date}"`);
    }
    this.date = parsed.toISOString().split("T")[0];
  }

  if (this.isModified("time")) {
    // Normalise to HH:MM 24-hour format
    const match = this.time.match(/^(\d{1,2}):(\d{2})(?:\s?(AM|PM))?$/i);
    if (!match) {
      throw new Error(`Invalid time value: "${this.time}". Expected HH:MM or HH:MM AM/PM`);
    }
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = match[3]?.toUpperCase();

    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    this.time = `${String(hours).padStart(2, "0")}:${minutes}`;
  }
});

// Prevent model re-registration during Next.js hot-reloads
const Event: Model<IEvent> =
  mongoose.models.Event ?? mongoose.model<IEvent>("Event", EventSchema);

export default Event;
