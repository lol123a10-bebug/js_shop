const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  const product = new Product({ title, price, description, imageUrl, userId: req.user });

  product
    .save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(console.log);
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
      });
    })
    .catch(console.error);
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description, imageUrl } = req.body;

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
