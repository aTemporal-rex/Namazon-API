const userData = require('../data/userData');
const cartData = require('../data/cartData');
const express = require('express');
const {body, validationResult} = require('express-validator');
const userRouter = express.Router();

// Validation to enforce POSTman body is correct
// firstName
// lastName
// email
const userValidators = [
    body('firstName').isAlpha(),
    body('lastName').isAlpha(),
    body('email').isEmail(),
];

// Supplemental route to get ALL users
userRouter.get('/user', async (req, res) => {
    try {
        const user = await userData.find().populate([
            {
                path: 'cart',
                model: 'Cart',
                populate: {
                    path: 'cartItems.storeItem',
                    model: 'StoreItem',
                }
            },
        ])
        res.send(user || 404);
    } catch (err) {
        res.send(400);
    }
});

///////////////////////////////////////////////////////////
// 1.1: GET /user/:UserId – Gets the user info given the id
userRouter.get('/user/:UserId', async (req, res) => {
    try {
        const user = await userData.findById(req.params.UserId).populate([
            {
                path: 'cart',
                model: 'Cart',
                populate: {
                    path: 'cartItems.storeItem',
                    model: 'StoreItem',
                }
            },
        ]);
        if (req.userJwt.user._id !== user.id) {
            return res.send(403);
        }
        res.send(user || 404);
    } catch (err) {
        res.send(400);
    }
});

///////////////////////////////////////////////////////////
// 1.2 POST/user – Creates a new user
userRouter.post('/user', userValidators,
    async (req, res) => {
        // This code validates the post body to make sure it has all the minimum pieces we need to create a user
        if (!validationResult(req).isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const cart = await cartData.create({cartItems:[]});
        const userInfo = req.body;
        userInfo.cart = cart;
        const user = await userData.create(userInfo);

        res.send(user);
    }
);

///////////////////////////////////////////////////////////
// 2.1 GET /user/:UserId/cart Gets the user’s cart
userRouter.get('/user/:UserId/cart', async (req, res) => {
    //find the user
    try {
        const user = await userData.findById(req.params.UserId).populate([
            {
                path: 'cart',
                model: 'Cart',
                populate: {
                    path: 'cartItems.storeItem',
                    model: 'StoreItem',
                }
            },
        ]);
        if (req.userJwt.user._id !== user.id) {
            return res.send(403);
        }

        if (!user) {
            return res.sendStatus(404);
        }
        //find the users cart, or send a 404
        cart = user.cart;
        if (!cart) {
            return res.sendStatus(404);
        }
        res.send(cart);
    } catch (err) {
        res.send(400);
    }
});

///////////////////////////////////////////////////////////
//2.2 DELETE /user/:UserId/cart  – Empties the user’s cart
userRouter.delete('/user/:UserId/cart', async (req, res) => {
    let user = await userData.findById(req.params.UserId).populate('cart');
    //find the user
    if (!user) {
        return res.send(404);
    }
    //find the users cart
    user.cart.cartItems = [];
    const cart = await user.cart.save();
    //user = await user.save();

    res.send(user.cart);
});

module.exports = userRouter;