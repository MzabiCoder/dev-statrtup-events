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
    title: { type: String, required: true, trim: true },

    // Unique slug indexed for fast lookups; generated in pre-save hook
    slug: { type: String, unique: true, index: true },

    description: { type: String, required: true, trim: true },
    overview:    { type: String, required: true, trim: true },
    image:       { type: String, required: true, trim: true },
    venue:       { type: String, required: true, trim: true },
    location:    { type: String, required: true, trim: true },

    // Stored as ISO date string; normalised in pre-save hook
    date: { type: String, required: true },

    // Stored as HH:MM (24-hour); normalised in pre-save hook
    time: { type: String, required: true },

    mode:      { type: String, enum: ["online", "offline", "hybrid"], required: true },
    audience:  { type: String, required: true, trim: true },
    agenda:    { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags:      { type: [String], required: true },
  },
  { timestamps: true }
);

// ─── Pre-save hook ────────────────────────────────────────────────────────────
// Mongoose 9 uses promise-based middleware: throw to abort, return to continue.

EventSchema.pre("save", function () {
  // Regenerate slug only when title is new or has changed
  if (this.isModified("title")) {
    const normalizedTitle = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")  // strip non-alphanumeric chars
      .replace(/\s+/g, "-")           // collapse whitespace to hyphens
      .replace(/-+/g, "-");           // collapse consecutive hyphens
    // The document ID keeps repeated titles unique, including concurrent saves.
    this.slug = `${normalizedTitle || "event"}-${this._id}`;
  }

  // Normalise date: accept any parseable string, store as YYYY-MM-DD
  if (this.isModified("date")) {
    const parsed = new Date(this.date);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date value: "${this.date}"`);
    }
    this.date = parsed.toISOString().split("T")[0]; // "YYYY-MM-DD"
  }

  // Normalise time: accept H:MM or HH:MM, store as zero-padded HH:MM
  if (this.isModified("time")) {
    const match = this.time.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      throw new Error(`Invalid time value: "${this.time}". Expected HH:MM`);
    }
    const hours   = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours > 23 || minutes > 59) {
      throw new Error(`Time out of range: "${this.time}"`);
    }
    this.time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // Guard against empty arrays slipping past required validation
  if (this.agenda.length === 0) throw new Error("agenda must contain at least one item");
  if (this.tags.length === 0)   throw new Error("tags must contain at least one item");
});

// ─── Model ────────────────────────────────────────────────────────────────────

// Guard against model re-registration during Next.js hot-reloads
const Event: Model<IEvent> =
  mongoose.models.Event ?? mongoose.model<IEvent>("Event", EventSchema);

export default Event;
