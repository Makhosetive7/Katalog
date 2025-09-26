import User from "../../model/user/user.js";
import jwt from "jsonwebtoken";

export const demoLogIn = async (req, res) => {
  try {
    console.log(" demo Login attempt:");
    const demoUserId = `guest_${Date.now()}`;

    const demoUser = await User.create({
      username: `guest_${Math.floor(Math.random() * 10000)}`,
      email: `${demoUserId}@example.com`,
      password: Math.random().toString(36).slice(-8),
      isDemo: true,
      createdAt: new Date(),
      role: "demo",
    });

    const token = jwt.sign(
      { userId: demoUser._id, isDemo: true },
      process.env.JWT_SECRET,
      { expiresIn: "30m" } // Token valid for 30 minutes
    );
    res.status(200).json({
      token,
      user: {
        id: demoUser._id,
        username: demoUser.username,
        email: demoUser.email,
        password: demoUser.password,
      },
      message:
        "Demo login successful. Note: This session will expire in 30 minutes.",
    });
  } catch (error) {
    console.log("Demo login failed:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
