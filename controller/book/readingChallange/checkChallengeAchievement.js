import Achievement from "../../../model/readingAchiervements.js";
import ReadingChallenge from "../../../model/readingChallange.js";

export const checkChallengeAchievement = async (userId, challengeId) => {
  const challenge = await ReadingChallenge.findById(challengeId);

  if (challenge && challenge.completed) {
    const exists = await Achievement.findOne({
      user: userId,
      type: "challenge_completed",
      "metadata.value": challenge.year,
    });

    if (!exists) {
      await Achievement.create({
        user: userId,
        type: "challenge_completed",
        level:
          challenge.goal >= 52
            ? "platinum"
            : challenge.goal >= 26
            ? "gold"
            : "silver",
        title: `${challenge.year} Reading Champion`,
        description: `Completed your goal of reading ${challenge.goal} books in ${challenge.year}`,
        metadata: { value: challenge.year, goal: challenge.goal },
      });
    }
  }
};
