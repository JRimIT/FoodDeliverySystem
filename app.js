import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import ejs from 'ejs';
import path from 'path';

import { jwtPassport, verifyAdmin, verifyUser } from './config/jwtConfig.js';
import session from 'express-session';
import sessionConfig from './config/sessionConfig.js';

import authRoute from './routes/auth.route.js';
import productRoute from './routes/product.route.js';
import menuRoute from './routes/menu.route.js';
import detailProduct from './routes/detail.product.route.js';
import cartRoute from './routes/Cart.route.js';
import adminRoute from './routes/admin.route.js';
import staticRoute from './routes/static.route.js';
import profileRoute from './routes/profile.routes.js';
import reviewRoute from './routes/review.route.js';
import contactRoutes from './routes/contact.route.js';
import discountRoute from './routes/discount.route.js';
import shipperRoutes from './routes/shipper.route.js';

import { connectToMongoDB } from './db/connectToMongoDB.js';

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));

app.use(session(sessionConfig));

app.use(jwtPassport.initialize());

app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    res.render('partials/index');
});

app.use('/', authRoute);
app.use('/', verifyUser, productRoute);
app.use('/', verifyUser, menuRoute);
app.use('/', verifyUser, detailProduct);
app.use('/', verifyUser, cartRoute);
app.use('/', staticRoute);
app.use('/', verifyUser, profileRoute);
app.use('/', verifyUser, reviewRoute);
app.use('/', contactRoutes);
app.use('/', verifyUser, discountRoute);
app.use('/shipper', shipperRoutes);

app.use('/', verifyAdmin, adminRoute);

// catch 404
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

export default app;
// Server start
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     connectToMongoDB();
//     console.log(`Server started on port http://localhost:${PORT}`);
// });
