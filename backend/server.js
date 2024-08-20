// server.js
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Product Catalogs
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add to Basket
app.post('/api/basket', (req, res) => {
  const { userId, productId, quantity } = req.body;
  db.run('INSERT INTO basket (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product added to basket' });
  });
});

// New GET Basket API
app.get('/api/basket/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const sql = `
    SELECT 
      b.id as basket_item_id,
      p.id as product_id,
      p.name,
      p.price,
      b.quantity
    FROM 
      basket b
    JOIN 
      products p ON b.product_id = p.id
    WHERE 
      b.user_id = ?
  `;
  
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const total = rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      items: rows,
      total: parseFloat(total.toFixed(2))
    });
  });
});


app.delete('/api/basket/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  db.run('DELETE FROM basket WHERE user_id = ?', [userId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Basket cleared successfully' });
  });
});

// Checkout
/*app.post('/api/checkout', (req, res) => {
  const { userId, totalAmount } = req.body;
  // console.log('totalAmount', totalAmount)
  db.run('INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)', [userId, totalAmount, 'pending'], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Order created', orderId: this.lastID });
  });
});
*/

// server.js or wherever your Express routes are defined
app.post('/api/checkout', (req, res) => {
  const { userId, name, email, address, totalAmount, items } = req.body;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      'INSERT INTO orders (user_id, name, email, address, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, email, address, totalAmount, 'pending'],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }

        const orderId = this.lastID;

        const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        
        items.forEach(item => {
          stmt.run(orderId, item.product_id, item.quantity, item.price);
        });

        stmt.finalize(err => {
          if (err) {
            db.run('ROLLBACK');
            res.status(500).json({ error: err.message });
            return;
          }

          db.run('COMMIT');
          res.json({ message: 'Order created', orderId: orderId });
        });
      }
    );
  });
});

// Confirm Payment
app.post('/api/confirm-payment', (req, res) => {
  const { orderId } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', ['paid', orderId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Payment confirmed' });
  });
});

app.get('/api/orders/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  db.all('SELECT * FROM orders WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// server.js or wherever your Express routes are defined
app.get('/api/orders', (req, res) => {
  const query = `
    SELECT o.*
    FROM orders o
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});



app.get('/api/orders/:orderId', (req, res) => {
  const orderId = parseInt(req.params.orderId);
  // console.log('ORDER ID', orderId);
  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    // console.log('orders', order)
    // Fetch order items (you'll need to create an order_items table)
    db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, items) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        orderId: order.id,
        items: items,
        total: order.total_amount,
        status: order.status
      });
    });
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
