import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "Admin User",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN"],
      default: "ADMIN",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordOTP: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

// Hash password before saving if modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate 6-digit OTP (10-minute validity)
userSchema.methods.getResetPasswordOTP = function () {
  // Generate random 6-digit number string between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and store in DB
  this.resetPasswordOTP = crypto.createHash("sha256").update(otp).digest("hex");

  // Expire in 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

export const User = mongoose.model("User", userSchema);
