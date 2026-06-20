import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);

    // Distinguish expired token from other JWT errors
    if (error && error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        expiredAt: error.expiredAt,
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
