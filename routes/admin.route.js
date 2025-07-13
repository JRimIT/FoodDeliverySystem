import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import axios from 'axios';
import https from 'https'
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import { verifyUser } from '../config/jwtConfig.js';
import Cart from '../models/cart.model.js';
import { countProduct } from '../controllers/countCart.js';

const router = express.Router();
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

router.get('/admin/Home', (req, res) => {


    res.render('admins/Home', { user: req.user })
})

router.get('/admin/manageUser', async (req, res) => {
    try {
        const users = await User.find({})
        res.render('admins/manageUser', { users })

    } catch (error) {
        console.error("Error /admin/manageUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/admin/users/edit/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const user = await User.findById(userId)

        res.render('admins/manageUserEdit', { user })


    } catch (error) {
        console.error("Error /admin/users/edit/:userId: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.post('/admin/users/edit/:userId', async (req, res) => {
    try {
        const { username, role } = req.body
        const userId = req.params.userId
        const user = await User.findByIdAndUpdate(userId, {
            $set: { username: username, role: role }
        })



        res.redirect('/admin/manageUser')


    } catch (error) {
        console.error("Error /admin/users/edit/:userId: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.post('/admin/users/delete/:userId', async (req, res) => {
    try {
        const userId = req.params.userId

        await User.findByIdAndDelete(userId)
        res.redirect('/admin/manageUser')
    } catch (error) {
        console.error("Error //admin/users/delete: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
})



export default router;