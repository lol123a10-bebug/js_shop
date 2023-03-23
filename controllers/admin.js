const { validationResult } = require('express-validator');
const { Types } = require('mongoose');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title,
        imageUrl,
        price,
        description,
      },
      hasError: true,
      errorMessage: errors.array().at(0).msg,
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    // _id: new Types.ObjectId('640f747fb7662e393996cdfd'),
    title,
    price,
    description,
    imageUrl,
    userId: req.user,
  });

  product
    .save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      // res.redirect('/500');
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   product: {
      //     title,
      //     imageUrl,
      //     price,
      //     description,
      //   },
      //   hasError: true,
      //   errorMessage: 'Database operation failed, please try again.',
      //   validationErrors: [],
      // });

      const error = new Error('Creating an product failed');
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render('admin/products', {
        products,
        pageTitle: 'Admin products',
        path: '/admin/products',
      });
    })
    .catch(console.log);
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    res.redirect('/');
  }

  const { productId } = req.params;

  Product.findById(productId)
    .then((product) => {
      if (!product) return res.redirect('/');

      res.render('admin/edit-product', {
        pageTitle: 'Edit product',
        path: '/admin/edit-product',
        editing: editMode,
        product,
        validationErrors: [],
      });
    })
    .catch(console.error);
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description, imageUrl } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit product',
      path: '/admin/add-product',
      editing: true,
      product: {
        _id: productId,
        title,
        imageUrl,
        price,
        description,
      },
      hasError: true,
      errorMessage: errors.array().at(0).msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(productId)
    .then((product) => {
      if (!product) return;

      if (product.userId.toString() !== req.user._id.toString()) return;

      product.set({ title, price, description, imageUrl });
      return product.save();
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(console.error);
};

exports.postDeleteProduct = (req, res) => {
  const { productId } = req.body;

  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(console.error);
};
