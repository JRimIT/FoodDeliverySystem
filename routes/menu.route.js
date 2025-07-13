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



router.get('/Menu/listFoods', async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const category = req.query.category || 'All'
    const perPage = 2


    try {
        let query = {}

        if (category !== 'All') {
            query = { category: category }
        }


        const products = await Product.find(query).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage)


        const totalProducts = await Product.countDocuments(query)
        const totalPages = Math.ceil(totalProducts / perPage)

        const listCategory = await Product.find({}).select('category')

        if (req.user.userId) {
            const cartCount = await countProduct(req.user.userId)
            res.render('pages/Menu', {
                products,
                totalPages,
                selectedCategory: category,
                currentPage: page,
                listCategory,
                cartCount: cartCount,
                user: req.user
            })
        } else {

            res.render('pages/Menu', {
                products,
                totalPages,
                selectedCategory: category,
                currentPage: page,
                listCategory,
                cartCount: 0,
                user: req.user
            })
        }




    } catch (error) {
        console.error("Error fetching Feature Food:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


export default router;