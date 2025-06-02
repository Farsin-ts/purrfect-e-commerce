import express from 'express';
import { loginUser,registerUser,adminLogin, listUsers, blockUser, getUserOrders } from '../controllers/userController.js';
import adminAuth from '../middleware/adminAuth.js';
import { userOrders } from '../controllers/orderController.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)

userRouter.get('/list', listUsers); 
userRouter.post('/block', blockUser); 
userRouter.get('/orders/:userId', getUserOrders);


export default userRouter;