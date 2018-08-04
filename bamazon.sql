DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(30) NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (item_id)
);

ALTER TABLE products
ADD COLUMN product_sales DECIMAL(10,2) NOT NULL;

CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(100) NOT NULL,
  over_head_costs DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES 
("Beans", 1000.00),
("Drinks", 2500.00),
("Food", 500.00);

ALTER TABLE departments 
ADD COLUMN total_profit DECIMAL(10,2) NOT NULL;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
("Dark Roast, 1lb", "Beans", 10.00, 100), 
("Medium Roast, 1lb", "Beans", 10.00, 100), 
("Light Roast, 1lb", "Beans", 10.00, 100), 
("Muffin", "Food", 2.50, 20), 
("Egg and Cheese Sandwich", "Food", 5.00, 10), 
("Donut", "Food", 1.50, 15), 
("Cold Brew Coffee", "Drinks", 3.00, 50), 
("Hot Coffee", "Drinks", 2.00, 200), 
("Decaf", "Drinks", 2.00, 50), 
("Tea", "Drinks", 1.50, 150);

SELECT * FROM products;
