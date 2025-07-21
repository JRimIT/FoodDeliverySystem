import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios';
import https from 'https';
import User from '../models/user.model.js';
import passport from 'passport';
import { generateJWT } from '../config/jwtConfig.js';

const router = express.Router();

// Khởi tạo axios với HTTPS (bỏ kiểm tra SSL cho môi trường dev)
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// ==== Giao diện ====

router.get('/goToSignUpPage', (req, res) => {
    res.render('auth/signup');
});

router.get('/goToLoginPage', (req, res) => {
    res.render('auth/login');
});

router.get('/login', (req, res) => {
    const error = req.query.error;
    res.render('auth/login', { error });
});

// ==== Đăng ký tài khoản ====

router.post('/auth/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).send('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role });
        await user.save();

        res.redirect('/goToLoginPage');
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).send("Registration failed");
    }
});

// ==== Đăng nhập và tạo session ====

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt:", username);

    try {
        const user = await User.findOne({ username });
        if (!user) return res.redirect('/login?error=UserNotFound');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.redirect('/login?error=InvalidPassword');

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        req.session.token = token;
        req.session.user = user; // ✅ Cho phép dùng user trong EJS như navbar

        res.redirect('/listFeatureFood');
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Login failed");
    }
});


// auth facebook

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = generateJWT(req.user);
        const user = req.user;
        console.log("User /auth/facebook/callback: ", user);

        req.session.token = token;
        req.session.user = user;
        res.redirect('/listFeatureFood');
        // res.json({ token }); // Gửi JWT về client
    }
);


export default router;
