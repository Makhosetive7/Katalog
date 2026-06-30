import User from "../../model/user/user.js";
import ReadingStreak from "../../model/readingStreak.js";
import ReadingGoal from "../../model/readingGoals.js";
import { createTransporter } from "../emailService/emailService.js";

const buildNudgeEmail = (user, nudges) => {
  const lines = nudges.map((n) => `<li>${n}</li>`).join("");
  return `
    <h2>Your reading nudge from Katalog</h2>
    <p>Hi ${user.profile?.firstName || user.username},</p>
    <ul>${lines}</ul>
    <p><a href="${process.env.CLIENT_URL}/dashboard">Open your dashboard</a></p>
  `;
};

export const collectNudgesForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user?.preferences?.emailNotifications) return [];

  const nudges = [];
  const streak = await ReadingStreak.findOne({ user: userId });

  if (streak?.currentStreak > 0 && streak.lastReadingDate) {
    const last = new Date(streak.lastReadingDate);
    last.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (last.getTime() < yesterday.getTime()) {
      nudges.push(
        `Your ${streak.currentStreak}-day reading streak is at risk. Log a session today to keep it going.`
      );
    }
  }

  const soonGoals = await ReadingGoal.find({
    user: userId,
    completed: false,
    endDate: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  if (soonGoals.length > 0) {
    nudges.push(
      `You have ${soonGoals.length} reading goal${soonGoals.length === 1 ? "" : "s"} due in the next 3 days.`
    );
  }

  if (nudges.length === 0 && (!streak || streak.currentStreak === 0)) {
    nudges.push("Start a reading session today and begin building your streak.");
  }

  return nudges;
};

export const sendReadingNudge = async (userId) => {
  const user = await User.findById(userId);
  if (!user?.preferences?.emailNotifications) return { sent: false, reason: "notifications_disabled" };

  const nudges = await collectNudgesForUser(userId);
  if (nudges.length === 0) return { sent: false, reason: "no_nudges" };

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Your Katalog reading nudge",
    html: buildNudgeEmail(user, nudges),
  });

  return { sent: true, nudges };
};

export const previewNudges = async (req, res) => {
  try {
    const nudges = await collectNudgesForUser(req.userId);
    res.json({ nudges, emailEnabled: req.user.preferences?.emailNotifications ?? true });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const triggerNudgeEmail = async (req, res) => {
  try {
    const result = await sendReadingNudge(req.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};
