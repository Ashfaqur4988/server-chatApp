import jwt from "jsonwebtoken";

const generateToken = (userId, response) => {
  const age = 1000 * 60 * 60 * 24 * 2; //2 days
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: age,
  });

  response.cookie("token", token, {
    maxAge: age,
    httpOnly: true, //not accessible to js //prevent XSS cross site scripting
    sameSite: "strict", //CSRF attacks, cross site req forgery
    secure: process.env.NODE_ENV !== "development", //HTTPS if not in dev
  });

  return token;
};

export default generateToken;
