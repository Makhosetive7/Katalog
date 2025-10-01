

export const logout = async (req, res) => {
  try {
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging out',
      error: error.message
    });
  }
};