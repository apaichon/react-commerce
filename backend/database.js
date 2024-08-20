// database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./ecommerce.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the ecommerce database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    imageUrl TEXT
  )`);

  db.run(`INSERT INTO products (name, price, description, imageUrl) VALUES
('Laptop', 999.99, 'High-performance laptop with 16GB RAM and 512GB SSD' , 'laptop.jpeg'),
('Smartphone', 699.99, 'Latest model with 5G capabilities and triple camera', 'smartphone.jpeg'),
('Wireless Headphones', 199.99, 'Noise-cancelling headphones with 30-hour battery life','wirelessheadphone.jpeg'),
('Smart Watch', 249.99, 'Fitness tracker with heart rate monitor and GPS', 'smartwatch.jpeg'),
('Tablet', 399.99, '10-inch tablet with 64GB storage and 12MP camera', 'tablet.jpeg');
`);

  db.run(`CREATE TABLE IF NOT EXISTS basket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_date datetime default current_timestamp,
    user_id INTEGER,
    name TEXT,
    address TEXT,
    email TEXT,
    total_amount REAL,
    status TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  
});

module.exports = db;