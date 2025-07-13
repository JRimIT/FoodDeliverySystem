import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import axios from 'axios';
import https from 'https'
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import { countProduct } from '../controllers/countCart.js';

const router = express.Router();
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

router.get('/Home', (req, res) => {
    res.redirect('/listFeatureFood')
})

router.post('/api/createFood', async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            imageUrl,
            category
        } = req.body

        const product = await Product.create({ name, description, price, imageUrl, category })
        if (!product) {
            res.status(401).json({ message: "Fail to create Product" });
        }

        res.status(200).json(product)

    } catch (error) {
        console.error("Error fetching /api/createFood:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/listFeatureFood', async (req, res) => {
    try {
        const product = await Product.find().sort({ createdAt: -1 }).limit(6).select('name price imageUrl category');
        if (!product) {
            res.status(200).json({ message: "Not have any products" });
        }

        const cartCount = await countProduct(req.user.userId)



        // res.status(200).json(product);
        res.render('pages/Home', {
            listFeatureFood: product,
            cartCount: cartCount,
            user: req.user
        })


    } catch (error) {
        console.error("Error fetching Feature Food:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})




export default router;