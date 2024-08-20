select * from orders
drop table products

drop table orders 
drop table order_items


CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  price REAL,
  FOREIGN KEY (order_id) REFERENCES orders (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
);

select * from orders
select * from order_items


SELECT * FROM order_items WHERE order_id =1
SELECT * FROM orders WHERE id =1