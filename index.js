const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user')
const MongoConnect = require('./util/database').mongoConnect;
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    User.findById('637459c155799d7697bac398')
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id);
            next();
        })
        .catch(err => console.log(err))
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

MongoConnect(() => {
    app.listen(3000);
})