import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../Models/usermode';

export const register = async (req, res) => {


    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({
            success: false, message: "Missing details"
        })
    }

    try {


        const existingUser = await userModel.findOne({ email })

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();


        try {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
              expiresIn: '7d',
            });
          
            res.cookie('token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite:process.env.NODE_ENV === 'production' ? 'none' :"strict",
              maxAge:7*24*60*60*1000
            });
          
            res.json({ success: true, message: 'Token generated successfully', token });
          } catch (error) {
            res.json({ success: false, message: error.message });
          }
          
    }
    catch (err) {
        res.json({ success: false, message: err.message })
    }
}