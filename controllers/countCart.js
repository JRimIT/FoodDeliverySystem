import Cart from "../models/cart.model.js"

export const countProduct = async (userId) => {
    const cart = await Cart.findOne({ userId: userId });

    if (!cart || !cart.items) {
        return 0;
    }



    return cart.items.length;
};