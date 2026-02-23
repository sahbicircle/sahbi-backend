const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: false }, // Optional for OAuth (Google/Apple)
  authProvider: {
    type: String,
    enum: ["local", "google", "apple"],
    default: "local",
  },
  googleId: String,
  appleId: String,
  gender: String,
  personality: {
    firstImpression: String,
    selfView: String,
    planningStyle: String,
    rechargeStyle: [String],
    socialPreference: String,
    socialPace: String,
    conversationStart: String,
    talkStyle: String,
    favoriteTopics: [String],
    dinnerStyle: String,
    superpower: String,
  },
  relationshipStatus: String,
  city: String,
  goalsFromSahbi: [String],
  workStatus: String,
  photoUrl: { type: [String], default: [] },
  phoneNumber: { type: String, sparse: true, unique: true },
  verifiedPhone: { type: Boolean, default: false },
  birthday: Date,
  interests: [String],
  lifestyle: Object,
  subscription: String, //{ type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  trustScore: { type: Number, default: 5 },
  facialDataId: String,
  faceVerified: Boolean,
  likedProfiles: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  resetPasswordCode: String,
  resetPasswordExpires: Date,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
