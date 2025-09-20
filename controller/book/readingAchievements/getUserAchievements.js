import Achievement from "../../../model/readingAchiervements.js";

export const getUserAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({
      //user: req.user.id
    }).sort({
      earnedAt: -1,
    });

    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
