import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../Models/usermode.js";
import transporter from "../config/nodemailler.js";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //sending email
    const mailOptions={
      from: process.env.SENDER_EMAIL, // Fix the typo here
      to: email,
      subject: "Hello everybody and welcome to today match",
      text: `Here started the Match Mr/Ms : ${email}`
    }
    try {
      console.log("Attempting to send email to:", email);
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.response);
    } catch (error) {
      console.error("Failed to send email:", error.message);
      // If you have detailed error, log more properties
      if (error.code) console.error("Error code:", error.code);
      if (error.command) console.error("Failed command:", error.command);
    }



    res.status(201).json({ success: true, message: "User registered successfully", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendVerifyotp=async(req,res)=>{
  try{
    const {userId}=req.body;
    const user=await userModel.findById(userId);

    if(user.isAccountVerified){
      return res.jso({success:false,message:"uer Already verified"})
    }

    const otp=String(Math.floor(100000+Math.random() *900000))

    user.verifyOtp=otp;
    user.verifyOtpExpireAt=Date.now()+24*60*60*1000
    await user.save();

    const mailOptions={
      from: process.env.SENDER_EMAIL, // Fix the typo here
      to: user.email,
      subject: "Account verification otp",
      text: `Your otp is ${otp}.verify your account using this otp`
    }
    await transporter.sendMail(mailOptions)
    res.json({success:true,message:'verification ot[ send your email'})
    
  }
  catch(err){
    res.json({success:false,message:err.message})
  }
}

