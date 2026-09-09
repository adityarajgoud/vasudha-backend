import { User } from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// Super Admin: List all Admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "ADMIN" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Super Admin: Create new Admin & send credentials email
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const newAdmin = await User.create({
      name: name || "Admin User",
      email: email.toLowerCase().trim(),
      password,
      role: "ADMIN",
      isActive: true,
    });

    // Send email notification with login credentials
    const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;
    const emailHtml = `
      <h3>Welcome to Vasudha Foundation Data Platform</h3>
      <p>Hello ${newAdmin.name},</p>
      <p>You have been assigned an Admin account by the Super Admin.</p>
      <p><strong>Login Portal:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Email:</strong> ${newAdmin.email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please log in and update your password if needed.</p>
    `;

    try {
      await sendEmail({
        email: newAdmin.email,
        subject: "Your Admin Account Credentials - Vasudha Foundation",
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error("[Email Notification Error]", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Admin account created and credentials dispatched",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Super Admin: Enable/Disable Admin account
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id);

    if (!admin || admin.role !== "ADMIN") {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin ${admin.isActive ? "activated" : "deactivated"} successfully`,
      admin: {
        id: admin._id,
        email: admin.email,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Super Admin: Delete Admin account
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id);

    if (!admin || admin.role !== "ADMIN") {
      return res.status(404).json({ message: "Admin not found" });
    }

    await admin.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Admin removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
