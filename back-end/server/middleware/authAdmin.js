
const verifyAdmin = (req, res, next) => {
  // 1. Check if user exists in the request (is logged in)
  if (!req.user_id) {
    return res.status(401).json({ message: "Unauthorized: No user found" });
  }

  // 2. Check the role. 
  // Make sure your database saves roles as 'admin', 'user', etc.
  if (req.role === 'admin') {
    next(); // User is admin, proceed to the controller
  } else {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
};

module.exports = verifyAdmin;
