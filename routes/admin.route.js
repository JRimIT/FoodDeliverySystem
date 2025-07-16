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
import Order from '../models/order.model.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// Multer config for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

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

// Admin: View and manage all orders
router.get('/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'username')
            .populate('items.productId', 'name price imageUrl');
        res.render('admins/manageOrders', { orders });
    } catch (error) {
        console.error('Error /admin/orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: Update order status
router.post('/admin/orders/update/:orderId', async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.orderId, { status });
        res.redirect('/admin/orders');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: List all products
router.get('/admin/products', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.render('admins/manageProducts', { products });
    } catch (error) {
        console.error('Error /admin/products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: Show create product form
router.get('/admin/products/create', (req, res) => {
    res.render('admins/createProduct');
});

// Admin: Handle product creation
router.post('/admin/products/create', async (req, res) => {
    try {
        const { name, description, price, imageUrl, category } = req.body;
        await Product.create({ name, description, price, imageUrl, category });
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: Show edit product form
router.get('/admin/products/edit/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        res.render('admins/editProduct', { product });
    } catch (error) {
        console.error('Error /admin/products/edit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: Handle product update
router.post('/admin/products/edit/:productId', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        let updateData = { name, description, price, category };
        if (req.file) {
            updateData.imageUrl = '/uploads/' + req.file.filename;
        } else if (req.body.imageUrl) {
            updateData.imageUrl = req.body.imageUrl;
        }
        await Product.findByIdAndUpdate(req.params.productId, updateData);
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: Delete product
router.post('/admin/products/delete/:productId', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.productId);
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;