const { db } = require('../config/db'); 


exports.testAuth = async (req, res) => {
  try {
    // Optional: you can test DB connection here
    const [rows] = await db.query('SELECT 1 AS test');
    
    res.status(200).json({
      success: true,
      message: "Authentication test route running successfully",
      databaseStatus: "connected",
      // you can remove databaseStatus if you don't want to show it
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({
      success: false,
      message: "Test route failed",
      error: error.message
    });
  }
};





exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // WARNING: This is plain text comparison (only for learning)
    // In production → use bcrypt.compare(password, user.user_pass)
    if (password !== user.user_pass) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Success - in real app you would generate JWT here
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.user_name,
        email: user.user_email
      }
      // token: "jwt-token-here" ← add later
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};