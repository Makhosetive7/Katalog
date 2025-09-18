

export const logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
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