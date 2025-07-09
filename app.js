import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import ejs from 'ejs';
import path from 'path';

import { jwtPassport, verifyAdmin, verifyUser } from './config/jwtConfig.js';
import session from 'express-session';
import sessionConfig from './config/sessionConfig.js';

import authRoute from './routes/auth.route.js'
import productRoute from './routes/product.route.js'
import menuRoute from './routes/menu.route.js'
import detailProduct from './routes/detail.product.route.js'
import cartRoute from './routes/Cart.route.js'

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
})

app.use('/', authRoute)
app.use('/', verifyUser, productRoute)
app.use('/', verifyUser, menuRoute)
app.use('/', verifyUser, detailProduct)
app.use('/', verifyUser, cartRoute)

// Server start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    connectToMongoDB()
    console.log(`Server started on port http://localhost:${PORT}`);
});
