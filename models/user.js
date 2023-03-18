const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({ productId: product._id, quantity: newQuantity });
  }

  const updatedCart = { items: updatedCartItems };

  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => item.productId.toString() !== productId.toString());

  this.cart = updatedCartItems;

  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = {
    items: [],
  };

  return this.save();
};

module.exports = model('User', userSchema);

// const { ObjectId } = require('mongodb');
// const { getDb } = require('../utils/database');

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     return db.collection('users').insertOne(this);
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });

//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity });
//     }

//     const updatedCart = { items: updatedCartItems };
//     const db = getDb();
//     return db.collection('users').updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: updatedCart } });
//   }

//   deleteItemFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter(
//       (item) => item.productId.toString() !== new ObjectId(productId).toString()
//     );

//     const db = getDb();

//     return db
//       .collection('users')
//       .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: updatedCartItems } } });
//   }

//   getCartProducts() {
//     const db = getDb();

//     const productIds = this.cart.items.map((item) => item.productId);

//     return db
//       .collection('products')
//       .find({
//         _id: {
//           $in: productIds,
//         },
//       })
//       .toArray()
//       .then((products) => {
//         return products.map((product) => {
//           return {
//             ...product,
//             quantity: this.cart.items.find((cartItem) => {
//               return cartItem.productId.toString() === product._id.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   async addOrder() {
//     const db = getDb();

//     const products = await this.getCartProducts();

//     const order = {
//       items: products,
//       user: {
//         _id: new ObjectId(this._id),
//         name: this.name,
//       },
//     };

//     await db.collection('orders').insertOne(order);

//     this.cart = { items: [] };

//     return db.collection('users').updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: [] } } });
//   }

//   getOrders() {
//     const db = getDb();

//     return db
//       .collection('orders')
//       .find({ 'user._id': new ObjectId(this._id) })
//       .toArray();
//   }

//   static findById(userId) {
//     const db = getDb();

//     return db.collection('users').findOne({ _id: new ObjectId(userId) });
//   }
// }

// module.exports = User;
