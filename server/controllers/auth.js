import { OTPModel, UserModel } from "../models/index.js";
import { JwtService } from "../services/index.js";
import mail from "../utils/Mailer.js";

const authenticate = async (req, res, next) => {
  // check if there is authorization header
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "You are not logged in! Please log in to get access.",
    });
  }

  // 2) Verification of token
  const decoded = await JwtService.verify(token);

  const user = await UserModel.findById(decoded._id);
  if (!user) {
    return res.status(401).json({
      message: "The user belonging to this token does no longer exists.",
    });
  }

  req.user = user;
  next();
};

const register = async (req, res, next) => {
  // const { error } = registerValidator.validate(req.body);
  // if (error) {
  //   return next(error);
  // }

  //---------------------check if user exists-------------------------------
  try {
    const { username, email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    //-------------------insert in db-----------------------------
    const new_user = await UserModel.create({ username, email, password });

    //-------------------------generate jwt tokens------------------

    const access_token = JwtService.sign({ _id: new_user._id });
    res.status(200).json({
      status: "success",
      message: "User created successfully",
      data: {
        _id: new_user._id,
        username: new_user.username,
        email: new_user.email,
        avatar: new_user.avatar,
        about: new_user.about,
        token: access_token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  //---------------------check if user exists-------------------------------

  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    //-------------------check password-----------------------------
    if (!await user.comparePassword(password))
      return res.status(400).json({
        status: "error",
        message: "Invalid username or password",
      });

    //-------------------------generate jwt tokens------------------
    const access_token = JwtService.sign({ _id: user._id });

    res.status(200).json({
      status: "success",
      message: "Loggeg in successfully",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        about: user.about,
        token: access_token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const sendEmail = async (req, res, next) => {
  const { email } = req.body;

  // check if email is in db
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "User not found",
    });
  }

  // generate randon 4 digit otp and save in db
  const otp = Math.floor(1000 + Math.random() * 9000);

  try {
    // Delete any existing OTP for the user
    await OTPModel.deleteOne({ reciever: email });

    // save new OTP in db
    await OTPModel.create({ otp, reciever: email });
  } catch (error) {
    next(error);
  }

  // send email with otp
  try {
    await mail(email, otp);
    res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    // check if otp exists in db
    const otp_doc = await OTPModel.findOne({ otp, reciever: email });

    if (otp_doc) {
      //delete otp from db before sending confirmation
      await OTPModel.findByIdAndDelete(otp_doc._id);

      return res.status(400).json({
        status: "success",
        message: "OTP verified successfully",
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // get user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User not found",
      });
    }

    // check if new password is same as old
    if (password === user.password) {
      return res.status(400).json({
        status: "error",
        message: "New password should not be same as old password",
      });
    }

    // update password
    user.password = password;
    await user.save();
    return res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { authenticate, register, login, sendEmail, verifyOTP, updatePassword };
