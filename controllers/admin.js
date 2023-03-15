const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    isAuthenticated: req.isLoggedIn,
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
  Product.find()
    .populate('userId')
    .then((products) => {
      res.render('admin/products', {
        products,
        pageTitle: 'Admin products',
        path: '/admin/products',
        isAuthenticated: req.isLoggedIn,
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
        isAuthenticated: req.isLoggedIn,
      });
    })
    .catch(console.error);
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description, imageUrl } = req.body;

  // const product = new Product(title, price, description, imageUrl, productId);

  Product.findById(productId)
    .then((product) => {
      if (product) {
        product.set({ title, price, description, imageUrl });
        product.save();
      }

      res.redirect('/admin/products');
    })
    .catch(console.error);
};

exports.postDeleteProduct = (req, res) => {
  const { productId } = req.body;

  Product.findByIdAndRemove(productId)
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(console.error);
};
