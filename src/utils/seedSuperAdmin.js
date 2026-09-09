import { User } from "../models/User.js";

export const seedSuperAdmin = async () => {
  try {
    const superAdminEmail =
      process.env.SUPERADMIN_EMAIL || "superadmin@vasudhaindia.org";
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || "Admin@123";

    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (!existingSuperAdmin) {
      await User.create({
        name: "Vasudha Super Admin",
        email: superAdminEmail,
        password: superAdminPassword,
        role: "SUPER_ADMIN",
        isActive: true,
      });
      console.log(
        `[Seed] Super Admin initialized successfully (${superAdminEmail})`,
      );
    } else {
      console.log(`[Seed] Super Admin already exists (${superAdminEmail})`);
    }
  } catch (error) {
    console.error(`[Seed] Error seeding Super Admin: ${error.message}`);
  }
};
