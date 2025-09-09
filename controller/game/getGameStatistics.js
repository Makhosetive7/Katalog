import Game from "../../model/game.js"

export const getGameStatistics = async (req, res) => {

  try {
    const statistics = await Game.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          totalPlaytime: { $sum: "$playtime" },
          averageRating: { $avg: "$rating" },
          byStatus: {
            $push: {
              status: "$status",
              count: 1,
            },
          },
          byPlatform: {
            $push: {
              platform: "$platform",
              count: 1,
            },
          },
        },
      },
      {
        $project: {
          totalGames: 1,
          totalPlaytime: 1,
          averageRating: { $round: ["$averageRating", 1] },
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: "$byStatus",
                as: "item",
                in: {
                  k: "$$item.status",
                  v: { $sum: "$$item.count" },
                },
              },
            },
          },
          platformCounts: {
            $reduce: {
              input: "$byPlatform",
              initialValue: {},
              in: {
                $mergeObjects: [
                  "$$value",
                  {
                    $arrayToObject: {
                      $map: {
                        input: "$$this.platform",
                        as: "plat",
                        in: {
                          k: "$$plat",
                          v: {
                            $add: [
                              { $ifNull: ["$$value.$$plat", 0] },
                              "$$this.count"
                            ]
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
      },
    ]);

    const result = statistics[0] || {
      totalGames: 0,
      totalPlaytime: 0,
      averageRating: 0,
      statusCounts: {},
      platformCounts: {},
    };

    res.json(result);
  } catch (error) {
    console.error("Failed getting game statistics:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};