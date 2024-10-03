import generateToken from "../util/generateToken.js";
import prisma from "../util/prisma.js";
import bcrypt from "bcrypt";

export const signUp = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    if (!username || !password || !email)
      return res.status(400).json({ error: "Please in all the fields" });

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) {
      res.status(400).json({ error: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });

    if (newUser) {
      //generate token
      generateToken(newUser.id, res);
    }

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
    // console.log("signup api");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Cannot register user" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    generateToken(user.id, res);

    res.status(201).json({
      id: user.id,
      username: user.username,
      profilePic: user.profilePic,
      email: user.email,
    });
    // console.log("login api");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Cannot login user" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token").status(201).json({ message: "user logout" });
    // console.log("logout api");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Cannot logout user" });
  }
};

export const getMe = async (req, res) => {
  try {
    const id = req.userId;
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) return res.status(404).json({ message: "No user found" });

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Cannot get self details" });
  }
};
