const storeData = require('../data/storeData');
const express = require('express');
const storeRouter = express.Router();


///////////////////////////////////////////////////////////
//DB 2.1 GET /StoreItem/Recent?num=10
storeRouter.get('/StoreItem/Recent', (req, res) => {
    return res.send(req.session.last10 || '');
})

///////////////////////////////////////////////////////////
// 4.1: GET /StoreItem/:StoreItemID – Get the store item’s details
storeRouter.get('/StoreItem/:StoreItemID', async (req, res) => {
    try {
        const storeItem = await storeData.findById(req.params.StoreItemID);
        if (storeItem) {
            if (!req.session.last10) {
                req.session.last10 = [];
            }
            req.session.last10.push(storeItem);
            if (req.session.last10.length > 10) {
                req.session.last10.shift();
            }
            return res.send(storeItem);
        }
        res.send(404);
    } catch (err) {
        res.send(400);
    }
});

///////////////////////////////////////////////////////////
// 4.2 GET /StoreItem?query=abc – Get all items that satisfy the regular expression query (or all items if no query)
storeRouter.get('/StoreItem', async (req, res) => {

    try {
        const re = new RegExp(req.query.query);
        let foundStoreItems = await storeData.find({$or: [{description: re}, {name: re}]});
        res.send(foundStoreItems);
    } catch (err) {
        res.send(400);
    }
});


module.exports = storeRouter;