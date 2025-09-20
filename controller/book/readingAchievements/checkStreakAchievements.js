import Achievement from "../../../model/readingAchiervements.js";

export const checkStreakAchievements = async (userId, streakLength) => {
  const achievements = [
    { length: 7, level: "bronze", title: "Weekly Reader" },
    { length: 14, level: "silver", title: "Fortnight Fanatic" },
    { length: 30, level: "gold", title: "Monthly Marathoner" },
    { length: 100, level: "platinum", title: "Century Streak" },
  ];

  for (const achievement of achievements) {
    if (streakLength === achievement.length) {
      const exists = await Achievement.findOne({
        user: userId,
        type: "streak_length",
        "metadata.value": achievement.length,
      });

      if (!exists) {
        await Achievement.create({
          user: userId,
          type: "streak_length",
          level: achievement.level,
          title: achievement.title,
          description: `Maintained a ${achievement.length}-day reading streak`,
          metadata: { value: achievement.length },
        });
      }
    }
  }
};
