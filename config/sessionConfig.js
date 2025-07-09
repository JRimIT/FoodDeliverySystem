import session from "express-session";
import MongoStore from "connect-mongo";

const sessionConfig = {
    secret: '12345678',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/Event_Management_System',
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    // cookie: {
    //     maxAge: 1000 * 60 * 60 * 24, // 14 days in milliseconds
    //     secure: false, // Set to true if using HTTPS
    //     httpOnly: true // Prevents client-side JavaScript from accessing the cookie
    // }
};
export default sessionConfig;