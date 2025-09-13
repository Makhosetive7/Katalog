import mongoose from "mongoose";

const chapterNoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    //required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  chapter: Number,
  note: String,
  isPublic: {
    type: Boolean,
    default: false,
  },
  keywords: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true 
});

chapterNoteSchema.index({ user: 1, book: 1, chapter: 1 });

export default mongoose.model("ChapterNote", chapterNoteSchema);