const express = require("express");
const { db, Vendor, Product, User, Cart } = require('./db');

const app = new express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// user routes----------------------------------------

app.use('/', express.static(__dirname + '/public'));
app.post('/login', login);

// vendor routes -------------------------------------

app.use('/vendor', express.static(__dirname + '/public/vendor.html'));
app.post('/vendor', addVendor);
app.get('/getvendors', getAllVendors);
app.post('/deletevendor', deleteVendor);


// product routes----------------------------------------

app.use('/product', express.static(__dirname + '/public/product.html'));
app.post('/product', addProduct);
app.get('/getproducts', getAllProducts);
app.post('/deleteproduct', deleteProduct);

// cart routes----------------------------------------

app.post('/addtocart', addToCart);
app.get('/getcartqty/:UserId', getCartQty);
app.post('/reducecartqty', reduceFromCart);
app.post('/deletecartitem', deleteItemCart);
app.get('/getcartitems/:UserId', getCartItems);
app.get('/getcarttotal/:UserId', getCartTotal);

//vendor methods----------------------------------

async function addVendor(req, res) {
    try {
        const result = await Vendor.create(req.body);
        res.send({ success: true });
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

async function getAllVendors(req, res) {
    const result = await Vendor.findAll();
    res.send(result);
}

async function deleteVendor(req, res) {
    try {
        const deleted = await Vendor.destroy({
            where: {
                id: req.body.id
            }
        })
        if (deleted != 0) {
            res.send({ success: true });
        }
        else {
            res.send({ success: false, errorMsg: 'Invalid ID' });
        }
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

//-----------------------------------------

// Product Methods------------------------------------------


async function addProduct(req, res) {
    try {
        const result = await Product.create(req.body);
        res.send({ success: true });
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

async function getAllProducts(req, res) {
    try {
        const result = await Product.findAll({
            include: Vendor
        })
        res.send(result);
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

async function deleteProduct(req, res) {
    try {
        const deleted = await Product.destroy({
            where: {
                id: req.body.id
            }
        })
        if (deleted != 0) {
            res.send({ success: true });
        }
        else {
            res.send({ success: false, errorMsg: 'Invalid ID' });
        }
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

// User Methods------------------------------------------

async function createUser(user) {
    try {
        const newUser = await User.create(user);
        return { success: true, newUser };
    } catch (e) {
        throw e;
    }
}

async function login(req, res) {
    try {
        const user = await User.findOne({
            where: {
                name: req.body.name
            },
            include: Cart
        })
        if (user) {
            res.send({ success: true, user });
        }
        else {
            const re = await createUser(req.body);
            if (re.success) {
                res.send(re);
            }
        }
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

// Cart Methods------------------------------------------

async function incrementCartQty(cartItem) {
    cartItem.increment('quantity')
}

async function decrementCartQty(cartItem) {
    cartItem.decrement('quantity')
}

async function deleteItemCart(req, res) {
    try {
        const deleted = await Cart.destroy({
            where: {
                UserId: req.body.UserId,
                ProductId: req.body.ProductId
            }
        })
        if (deleted != 0) {
            res.send({ success: true, deleted: true });
        }
        else {
            res.send({ success: false, errorMsg: 'Invalid ID' });
        }
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

async function addToCart(req, res) {
    try {
        const cartItem = await Cart.findOne({
            where: {
                UserId: parseInt(req.body.UserId),
                ProductId: parseInt(req.body.ProductId)
            }
        })
        if (cartItem) {
            await incrementCartQty(cartItem);
        }
        else {
            const result = await Cart.create(req.body);
        }
        res.send({ success: true });
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

async function reduceFromCart(req, res) {
    try {
        const cartItem = await Cart.findOne({
            where: {
                UserId: req.body.UserId,
                ProductId: req.body.ProductId
            }
        })
        if (cartItem.quantity > 1) {
            await decrementCartQty(cartItem);
            res.send({ success: true });
        }
        else {
            await deleteItemCart(req, res);
        }
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}


async function getCartQty(req, res) {
    try {
        const qty = await Cart.sum('quantity', {
            where: {
                UserId: req.params.UserId
            }
        });
        res.send({ success: true, quantity: qty });

    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

async function getCartTotal(req, res) {
    try {
        const items = await Cart.findAll({
            where: {
                UserId: req.params.UserId
            },
            include: Product
        });
        let total = 0;
        for (let item of items) {
            total += (item.quantity * item.Product.price);
        }
        res.send({ success: true, total: total });

    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

async function getCartItems(req, res) {
    try {
        const result = await Cart.findAll({
            where: {
                UserId: req.params.UserId
            },
            include: Product
        })
        res.send(result);
    } catch (e) {
        res.send({ success: false, errorMsg: e.message });
    }
}

//---------------------------------------------

const PORT = process.env.PORT || 8000
db.sync()
    .then(() => {
        app.listen(PORT)
    })