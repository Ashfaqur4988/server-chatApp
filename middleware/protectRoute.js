import jwt from "jsonwebtoken";

const protectRoute = (req, res, next) => {
  const token = req.cookies.token;
  try {
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) return res.status(403).json({ message: "token is not valid" });
      req.userId = payload.id;
      // console.log(`from verify function userId: ${req.userId}`);
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default protectRoute;
