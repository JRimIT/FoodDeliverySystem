import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'
import dotenv from 'dotenv';

dotenv.config();

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

// Passport JWT strategy
passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            console.log("JWT Payload:", jwt_payload);

            const user = await User.findById(jwt_payload.userId);
            if (user) return done(null, user);// gán user vào req.user
            else return done(null, false);
        } catch (err) {
            return done(err, false);
        }
    })
);


// Middleware để dùng trực tiếp thay vì passport.authenticate('jwt')
export const verifyUser = (req, res, next) => {
    // console.log("Verify user token: ", req.session.token);

    const authHeader = req.headers['authorization'] || `Bearer ${req.session.token}`


    const token = authHeader && authHeader.split(' ')[1]; // 'Bearer <token>'

    if (!token) {
        return res.status(403).json({ message: 'No token provided!' });
    }
    console.log("token verify: ", token);


    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token!' });
        }
        req.user = decoded;
        next();
    });
};

export const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'] || `Bearer ${req.session.token}`;
    const token = authHeader && authHeader.split(' ')[1]; // 'Bearer <token>'

    if (!token) {
        return res.status(403).json({ message: 'No token provided!' });
    }
    console.log("token verify: ", token);
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token!' });
        }

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }

        req.user = decoded;
        next();
    });
};

export const jwtPassport = passport;
