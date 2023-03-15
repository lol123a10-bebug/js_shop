const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  imageUrl: {
    type: String,
    required: true,
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = model('Product', productSchema);

// const { ObjectId } = require('mongodb');
// const { getDb } = require('../utils/database');

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       dbOp = db.collection('products').updateOne(
//         { _id: this._id },
//         {
//           $set: this,
//         }
//       );
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }

//     return dbOp.then(console.log).catch(console.log);
//   }

//   static fetchAll() {
//     const db = getDb();

//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then((products) => products)
//       .catch(console.log);
//   }

//   static findById(productId) {
//     const db = getDb();

//     return db
//       .collection('products')
//       .find({ _id: new ObjectId(productId) })
//       .next()
//       .then((product) => product)
//       .catch(console.log);
//   }

//   static deleteById(productId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .deleteOne({ _id: new ObjectId(productId) })
//       .catch(console.log);
//   }
// }

// module.exports = Product;
