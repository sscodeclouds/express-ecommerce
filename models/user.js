const getDb = require('../util/database').getDb;
const mongodb = require('mongodb')
class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }
    save() {
        const db = getDb();
        return db.collection('users').insertOne(this)
    }
    static findById(userId) {
        const db = getDb();
        return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)})
    }
    addToCart(product) {
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
                productId: new mongodb.ObjectId(product._id),
                quantity: newQuantity
            })
        }
        const updatedCart = {
            items: updatedCartItems
        }
        const db = getDb();
        return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: updatedCart}});
    }
    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(i => i.productId)
        return db.collection('products').find({_id: {$in: productIds}}).toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items.find(i => i.productId.toString() === p._id.toString()).quantity
                    }
                })
            })
            .catch(err => console.log(err))
    }
    deleteCartItem(productId) {
        const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId)
        const db = getDb();
        return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: {items: updatedCartItems}}});
    }
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
}

module.exports = User;