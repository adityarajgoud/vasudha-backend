import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET ||
      "super_secure_vasudha_foundation_jwt_secret_key_2026",
    { expiresIn: "7d" },
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact Super Admin." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// Request Password Reset OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Please provide an email address" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user registered with this email" });
    }

    // Generate 6-digit OTP and save its hash
    const otp = user.getResetPasswordOTP();
    await user.save({ validateBeforeSave: false });

    const messageHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #16a34a; margin-top: 0;">Vasudha Foundation</h2>
        <h3>Password Reset OTP</h3>
        <p>Hello ${user.name},</p>
        <p>Use the following 6-digit verification PIN to reset your account password. This PIN expires in <strong>10 minutes</strong>:</p>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 6px; letter-spacing: 6px; font-size: 28px; font-weight: bold; color: #0f172a; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, please disregard this message or alert your Super Admin immediately.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `${otp} is your Vasudha Foundation Reset PIN`,
        html: messageHtml,
      });

      res.status(200).json({
        success: true,
        message: "6-digit OTP sent to your email",
        otp, // returned for direct terminal/Postman testing
      });
    } catch (emailErr) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res
        .status(500)
        .json({ message: `Failed to deliver email: ${emailErr.message}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password via OTP
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are all required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Hash user-entered OTP to compare against DB
    const hashedOTP = crypto
      .createHash("sha256")
      .update(String(otp).trim())
      .digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOTP: hashedOTP,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP PIN" });
    }

    // Update password and clear OTP fields
    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
