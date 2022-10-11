const db = require('../util/database');

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save(id = 0) {
    if (id > 0) {
      return db.execute("UPDATE products SET title = ?, imageUrl = ?, description = ?, price = ? WHERE id = ?", [this.title, this.imageUrl, this.description, this.price, id]);
    }else {
      return db.execute("INSERT INTO products (title, imageUrl, description, price) VALUES (?, ?, ?, ?)", [this.title, this.imageUrl, this.description, this.price]);
    }
  }

  static delete(id) {
    return db.execute("DELETE FROM products WHERE id=?", [id]);
  }

  static fetchAll() {
    return db.execute('SELECT * FROM products');
  }

  static findById(id) {
    return db.execute('SELECT * FROM products WHERE id=?', [id]);
  }
};
