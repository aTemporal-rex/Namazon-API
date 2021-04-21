const cartData = require('../data/cartData');
const storeData = require('../data/storeData');
const express = require('express');
const {body, validationResult} = require('express-validator');
const cartRouter = express.Router();

// Validation to enforce POSTman body is correct
// storeItemId
// quantity
const cartValidators = [
    body('storeItemId').isString(),
    body('quantity').isNumeric(),
];

// Supplemental route to get ALL users
cartRouter.get('/cart',async (req, res) => {
    res.send(await cartData.find().populate('cartItems.storeItem'));
});

///////////////////////////////////////////////////////////
// 3.1 POST/cart/:CartId/cartItem – Add a new item to the cart
cartRouter.post('/cart/:cartId/cartItem', cartValidators,
    async (req, res) => {
        try {
            // This code validates the post body to make sure it has all the minimum pieces we need to create a user
            if (!validationResult(req).isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }
            // Find the correct cart
            let cart = await cartData.findById(req.params.cartId).populate('cartItems.storeItem');

            // See if we already have same item in cart, if we do, add the quantity
            const cartItemAlreadyInCart = await cart.cartItems.find(cartItem => {
                return cartItem.storeItem.id.toString() == req.body.storeItemId
            });
            if (cartItemAlreadyInCart) {
                cartItemAlreadyInCart.quantity += req.body.quantity;
            }
            //If not, add it to the cart
            else {
                // Create a new cartItem from the body
                let storeItem = await storeData.findById(req.body.storeItemId);
                const newCartItem = {storeItem, quantity: req.body.quantity};
                cart.cartItems.push(newCartItem);
            }

            cart = await cart.save();

            res.send(cart);
        }
        catch(e){
            res.send(e)
        }
    }
);

///////////////////////////////////////////////////////////
// 3.2 DELETE /cart/:CartId/cartItem/:cartItemId – Remove an item from the cart
cartRouter.delete('/cart/:cartId/cartItem/:cartItemId', async (req, res) => {
    // Find the correct cart
    let cart = await cartData.findById(req.params.cartId).populate('cartItems.storeItem');
    if (!cart){
        return res.sendStatus(404);
    }
    //find the correct Item in that cart
    const cartItemInCart = cart.cartItems.find(cartItem => {
        return cartItem.id.toString() == req.params.cartItemId
    });

    // If it isn't found, return from function and send a 404
    if (!cartItemInCart){
        return res.sendStatus(404);
    }

    // Else remove it from the array and send it.
    cart.cartItems.pull(cartItemInCart);
    cart = await cart.save();

    res.send(cart);
});

module.exports = cartRouter;