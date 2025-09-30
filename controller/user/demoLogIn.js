import User from "../../model/user/user.js";
import jwt from "jsonwebtoken";

export const demoLogIn = async (req, res) => {
  try {
    console.log("Demo Login attempt:");

    const demoUser = await User.create({
      username: `guest_${Math.floor(Math.random() * 10000)}`,
      email: `guest_${Date.now()}@example.com`,
      password: Math.random().toString(36).slice(-8),
      isDemo: true,
      demoExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const token = jwt.sign(
      { userId: demoUser._id, isDemo: true },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message:
        "Demo login successful. Note: This account will expire in 24hrs.",
      token,
      user: {
        id: demoUser._id,
        username: demoUser.username,
        email: demoUser.email,
        isDemo: demoUser.isDemo,
      },
    });
  } catch (error) {
    console.error("Demo login failed:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
