import ReadingChallenge from "../../../model/readingChallange.js";

export const setReadingChallenge = async (req, res) => {
  try {
    const { goal, year = new Date().getFullYear() } = req.body;
     const userId = req.user.id;

    let challenge = await ReadingChallenge.findOne({
       user: userId,
      year,
    });

    if (challenge) {
      challenge.goal = goal;
      await challenge.save();
    } else {
      challenge = await ReadingChallenge.create({
         user: userId,
        year,
        goal,
      });
    }

    res.json(challenge);
  } catch (error) {
    console.log("Failed setting reading challenge", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
