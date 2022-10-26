const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err)
        });

});
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
User.hasOne(Order);
Order.belongsTo(User);
Order.belongsToMany(Product, {through: OrderItem});
Product.belongsToMany(Order, {through: OrderItem});
sequelize.sync()
    .then(result => {
        return User.findByPk(1);
    })
    .then(user => {
        if(!user) {
            return User.create({name: 'Sourav', email: 'sourav@gmail.com'})
        }
        return user;
    })
    .then(user => {
        app.listen(port, () => {
            console.log(`App is listening on port ${port}`);
        });
    })
    .catch(err => {
        console.log(err);
    });
