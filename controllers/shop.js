const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(process.env.stripe_secret);

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;

const getProducts = (path) => async (req, res, next) => {
  const page = +(req.query.page ?? 1);

  try {
    const totalItems = await Product.find().countDocuments();

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render('shop/index', {
      products,
      pageTitle: 'Shop',
      path,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    next(err);
  }
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

exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId');

    const products = user.cart.items;

    let total = 0;

    products.forEach((product) => {
      total += product.quantity * product.productId.price;
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map((product) => {
        const { title, description, price } = product.productId;

        return {
          price_data: {
            unit_amount: price * 100,
            currency: 'usd',

            product_data: {
              name: title,
              description,
            },
          },
          quantity: product.quantity,
        };
      }),

      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
    });

    res.render('shop/checkout', {
      stripeKey: process.env.stripe_key,
      pageTitle: 'Checkout',
      products,
      totalSum: total,
      sessionId: session.id,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCheckoutSuccess = async (req, res) => {
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

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params;

  Order.findById(orderId)
    .then((order) => {
      if (!order) return next(new Error('Order not found.'));
      if (order.user.userId.toString() !== req.user._id.toString()) return next(new Error('Unauthorized.'));

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('content-disposition', `inline; filename="${invoiceName}"`);

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', { underline: true });

      pdfDoc.text('----------------');

      let totalPrice = 0;

      order.products.forEach((prod) => {
        totalPrice += prod.product.price * prod.quantity;
        pdfDoc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
      });

      pdfDoc.text('---');
      pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);

      pdfDoc.end();

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) return next(err);

      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader('content-disposition', `inline; filename="${invoiceName}"`);
      //   res.send(data);
      // });

      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
