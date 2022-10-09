const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);
const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};
module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};
            if(!err) {
                cart = JSON.parse(fileContent);
            }
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if (existingProduct) {
                updatedProduct = {...existingProduct};
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            }else {
                updatedProduct = {id, qty: 1};
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;

            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        });
    }
    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if(!err) {
                let cart = JSON.parse(fileContent);
                const product = cart.products.find(p => p.id === id);
                if(!product) return;
                let updatedProducts = {
                    products : cart.products.filter(p => p.id !== id),
                    totalPrice: cart.totalPrice - productPrice * product.qty
                };
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    console.log(err);
                });
            }
        });
    }

    static delete(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if(!err) {
                let cart = JSON.parse(fileContent);
                const cartProduct = cart.products.find(prod => prod.id === id);
                if(cartProduct) {
                    const updatedProducts = {
                        products: cart.products.filter(p => p.id !== id),
                        totalPrice: cart.totalPrice - productPrice * cartProduct.qty
                    };
                    fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                        console.log(err);
                    });
                }
            }
        });
    }
}