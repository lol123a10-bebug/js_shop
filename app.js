const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const errorController = require('./controllers/error');

const User = require('./models/user');

const userId = '640f739f2dd07e39c9c0646c';

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my very scecret value uauaua',
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  User.findById(userId)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(console.error);
});

app.use('/admin', adminRoutes);

app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect('mongodb+srv://soulbuster321:ghjcnj123a@node-js.izbqgum.mongodb.net/shop?retryWrites=true&w=majority')
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: 'Ayub',
          email: 'ayub@gma.co',
          cart: {
            items: [],
          },

          orders: { items: [], userId: userId },
        });
        user.save();
      }

      app.listen(3000);
    });
  })
  .catch(console.error);
