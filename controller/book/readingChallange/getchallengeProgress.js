import ReadingChallenge from "../../../model/readingChallange.js";

export const getChallengeProgress = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const challenge = await ReadingChallenge.findOne({
      user: req.user.id,
      year,
    });

    if (!challenge) {
      return res.status(404).json({ message: "No challenge found" });
    }

    const progress = {
      current: challenge.currentCount,
      goal: challenge.goal,
      percentage: Math.round((challenge.currentCount / challenge.goal) * 100),
      booksLeft: challenge.goal - challenge.currentCount,
      completed: challenge.completed,
    };

    res.json(progress);
  } catch (error) {
    console.log("Failed getting reading progress challenge");
    res.status(500).json({ message: error.message });
  }
};
