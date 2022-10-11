const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'express-ecommerce'
});

module.exports = pool.promise();