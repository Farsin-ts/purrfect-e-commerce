import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from 'mongoose';


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User doesn't exists" })
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: "Your account has been blocked. Contact support." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.status(400).json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: error.message })
    }
}

const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const listUsers = async (req, res) => {
    try {
      const users = await userModel.find({}, { password: 0 });
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
  const blockUser = async (req, res) => {
    try {
      const { userId } = req.body;
      
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.isBlocked = !user.isBlocked; 
      await user.save();
  
      res.status(200).json({ 
        success: true, 
        message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` 
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
};
  
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const orders = await orderModel.find({ userId });

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found for this user' });
        }

        res.status(200).json({ 
            success: true, 
            orders: orders.map(order => ({
                _id: order._id,
                items: order.items,   
                amount: order.amount,
                address: order.address,
                status: order.status,
                paymentMethod: order.paymentMethod,
                payment: order.payment,
                date: order.date,
                createdAt: order._id.getTimestamp(), 
            }))
        });

    } catch (error) {
        console.error('Error getting user orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};





export { loginUser, registerUser, adminLogin, listUsers, blockUser, getUserOrders }