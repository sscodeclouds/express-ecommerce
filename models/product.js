const fs = require('fs');
const path = require('path');
const cart = require('./cart');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
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

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save(id = 0) {
    if (id > 0) {
      getProductsFromFile(products => {
        const productIndex = products.findIndex(p => p.id === id);
        products[productIndex].title = this.title;
        products[productIndex].imageUrl = this.imageUrl;
        products[productIndex].description = this.description;
        products[productIndex].price = this.price;
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err);
        });
      });
    }else {
      this.id = Math.random().toString();
      getProductsFromFile(products => {
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err);
        });
      });
    }
  }

  static delete(id) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      const updatedProducts = products.filter(p => p.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if(!err) {
          cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      cb(product);
    });
  }
};
