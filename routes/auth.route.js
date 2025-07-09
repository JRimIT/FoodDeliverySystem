import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import axios from 'axios';
import https from 'https'
import User from '../models/user.model.js';

const router = express.Router();
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

router.get('/goToSignUpPage', async (req, res) => {
    res.render('auth/signup')
})
router.get('/goToLoginPage', async (req, res) => {
    res.render('auth/login')
})

router.post('/auth/register', async (req, res) => {
    const { username, password, role } = req.body;

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();

    // const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // res.status(201).json({ message: 'Signup successful' });
    res.redirect('/goToLoginPage')
}
)

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("Day la login: ", username, password);

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(401).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3h' });
    console.log("Token : ", token);
    req.session.token = token;
    // res.json({ message: 'Login successful', user, token });
    res.redirect('/listFeatureFood')
})

export default router;