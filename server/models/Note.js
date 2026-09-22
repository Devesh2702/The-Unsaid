import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    recipient: { type: String, required: true, trim: true },
    sender: { type: String, default: 'Anonymous', trim: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    paperTheme: { type: String, default: 'tea-stained' },
    fontFamily: { type: String, default: 'caveat' },
    inkColor: { type: String, default: 'sepia' },
    stampDesign: { type: String, default: 'botanical-rose' },
    waxSeal: { type: String, default: 'ruby-red' },
    tag: { type: String, default: 'Unsaid Words' },
    isPrivate: { type: Boolean, default: false },
    password: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    voiceUrl: { type: String, default: '' },
    reactions: {
      heart: { type: Number, default: 0 },
      hug: { type: Number, default: 0 },
      star: { type: Number, default: 0 },
      stamp: { type: Number, default: 1 }
    },
    createdAt: { type: Date, default: Date.now },
    postmarkLocation: { type: String, default: 'MIDNIGHT TELEGRAPH • DESK 4' }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Note || mongoose.model('Note', noteSchema);
