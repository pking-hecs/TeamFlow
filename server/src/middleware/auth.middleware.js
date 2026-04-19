import jwt from "jsonwebtoken";

const SECRET_KEY = "my-server-key";

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || SECRET_KEY,
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      req.user = decoded;
      next();
    }
  );
};

export default authenticate;