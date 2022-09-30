const path = require('path');
const fs = require('fs');
const rootDir = require('../util/path');
const p = path.join(rootDir, 'data', 'products.json');
const getProductFromFile = cb => {
    fs.readFile(p, "utf8", (err, fileContent) => {
        if(err || fileContent.length === 0) {
            cb([]);
        }else {
            cb(JSON.parse(fileContent));
        }
    });
};

module.exports = class Product {
    constructor(title, imageUrl, price, description) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    save() {
        getProductFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err);
            });
        });
    }

    static fetchAll(cb) {
        getProductFromFile(cb);
    }
}