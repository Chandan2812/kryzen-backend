// Function to validate username using regex
const isValidUsername = (username) => {
  // Allow only alphanumeric characters and underscores, at least 3 characters long
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  return usernameRegex.test(username);
};

// Function to validate password using regex
const isValidPassword = (password) => {
  //Password should be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  return passwordRegex.test(password);
};

const validation = (req, res, next) => {
  const { username, password } = req.body;

  // Validate username
  if (!isValidUsername(username)) {
    return res.status(400).json({ success: false, message: 'Invalid username format, username is at least 3 characters long' });
  }

  // Validate password
  if (!isValidPassword(password)) {
    return res.status(400).json({ success: false, message: 'Invalid password format, Password is at least 6 characters long and includes at least one uppercase letter, one lowercase letter, and one digit, and one special character' });
  }

  next();
};

module.exports = { validation };
