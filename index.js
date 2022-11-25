const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user')
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    User.findById('637fd6ba2d871ca324490c74')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err))
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://ecomm-sourav-93:Q262BP1wJEzGqdS3@cluster0.aniqof0.mongodb.net/shop?retryWrites=true&w=majority')
    .then(() => {

        User.findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        name: 'Sourav',
                        email: 'sourav@gmail.com',
                        cart: {
                            items: []
                        }
                    });
                    user.save();
                }
            })
            .catch(err => console.log(err))
        app.listen(3000);
    })
    .catch(err => console.log(err))
