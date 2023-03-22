const Product = require('../models/product');
const Order = require('../models/order');

const getProducts = (path) => (req, res) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        products,
        pageTitle: 'Shop',
        path,

        csrfToken: req.csrfToken(),
      });
    })
    .catch(console.log);
};

exports.getIndex = getProducts('/');

exports.getProducts = getProducts('/products');

exports.getProduct = (req, res) => {
  const { productId } = req.params;

  Product.findById(productId)
    .then((product) => {
      if (!product) return res.redirect('/404');

      res.render('shop/product-details', {
        pageTitle: product.title,
        product,
        path: '/products',
      });
    })
    .catch(console.log);
};

exports.postCart = (req, res) => {
  const { productId } = req.body;

  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.getCart = (req, res) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        pageTitle: 'Your cart',
        path: '/cart',
        products: products,
      });
    })
    .catch(console.error);
};

exports.postCartDeleteProduct = (req, res) => {
  const { productId } = req.body;

  req.user
    .removeFromCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(console.log);
};

exports.postOrder = async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.productId');

    const products = user.cart.items.map((item) => ({
      product: { ...item.productId._doc },
      quantity: item.quantity,
    }));

    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user,
      },

      products,
    });

    await order.save();

    await user.clearCart();

    res.redirect('/orders');
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = (req, res) => {
  Order.find({ 'user.userId': req.user })
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Your orders',
        path: '/orders',
        orders,
      });
    })
    .catch(console.error);
};
