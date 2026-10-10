
const jwt = require("jsonwebtoken");
const Parent = require("../models/parent");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const parent = await Parent.findById(decoded.parentId);

    if (!parent) {
      return res.status(401).json({
        success: false,
        message: "Parent account not found",
      });
    }

    req.parent = parent;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};

module.exports = authMiddleware;