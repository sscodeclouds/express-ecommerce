const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    })
    let newQuantity = 1;
    let updatedCartItems = [...this.cart.items];
    if(cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        })
    }
    const updatedCart = {
        items: updatedCartItems
    }
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.deleteCartItem = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId)
    this.cart.items = updatedCartItems;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);

/*class User {

    addOrder() {
         const db = getDb();
         return this.getCart()
             .then(products => {
                 const order = {
                     items: products,
                     user: {
                         id: new mongodb.ObjectId(this._id)
                     }
                 }
                 return db.collection('orders').insertOne(order)
             })
             .then(result => {
                 this.cart = {items: []};
                 return db.collection('users').updateOne(
                     {_id: new mongodb.ObjectId(this._id)},
                     {$set: {cart: {items: []}}}
                 )

             })
             .catch(err => console.log(err))
    }

    getOrder() {
        const db = getDb();
        return db.collection('orders').find({'user.id': new mongodb.ObjectId(this._id)}).toArray();
    }
}*/