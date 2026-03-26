CREATE DATABASE boutique_db;

\c boutique_db;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'seller',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    document_type VARCHAR(10) DEFAULT 'DNI', -- DNI, RUC, CE
    document_number VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    provider_id INT REFERENCES providers(id) ON DELETE SET NULL,
    description TEXT,
    cost_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL, -- S, M, L, XL, 38, 40, etc.
    color VARCHAR(30),
    stock INT DEFAULT 0,
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    customer_id INT REFERENCES customers(id),
    total DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL, -- IGV 18%
    payment_method VARCHAR(20) DEFAULT 'efectivo', -- efectivo, tarjeta, yape, plin, transferencia
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_details (
    id SERIAL PRIMARY KEY,
    sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
    variant_id INT REFERENCES product_variants(id), -- Referencia a variante, no producto general
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    provider_id INT REFERENCES providers(id),
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_details (
    id SERIAL PRIMARY KEY,
    purchase_id INT REFERENCES purchases(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    shop_name VARCHAR(150) DEFAULT 'BoutiquePro',
    currency VARCHAR(10) DEFAULT 'S/',
    tax_rate DECIMAL(5,2) DEFAULT 18.00
);

-- Insert defaults
INSERT INTO settings (shop_name, currency, tax_rate) VALUES ('Boutique Premium', 'S/', 18.00);

-- Insert default admin (admin@boutique.com / password: admin)
INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@boutique.com', '$2a$10$fV2A5Gf.zTcwv1N5YjO7L.O4R62V9WXZQoWvV8M7.Y.w3/N/Q4vG6', 'admin');

-- Performance Indices
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_provider ON products(provider_id);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_sale_details_sale ON sale_details(sale_id);
CREATE INDEX idx_sale_details_variant ON sale_details(variant_id);
CREATE INDEX idx_purchase_details_purchase ON purchase_details(purchase_id);
CREATE INDEX idx_purchase_details_product ON purchase_details(product_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_provider ON purchases(provider_id);
CREATE INDEX idx_expenses_user ON expenses(user_id);

