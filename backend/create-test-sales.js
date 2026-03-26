const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./db');

(async () => {
  const client = await pool.connect();
  try {
    console.log('Conectado a la base de datos');
    
    const clientes = await client.query('SELECT id FROM customers LIMIT 3');
    console.log('Clientes:', clientes.rows);
    
    const variantes = await client.query(`
      SELECT pv.id, p.sale_price 
      FROM product_variants pv 
      JOIN products p ON pv.product_id = p.id 
      LIMIT 5
    `);
    console.log('Variantes:', variantes.rows);
    
    for (let i = 0; i < 5; i++) {
      const clienteId = clientes.rows[i % clientes.rows.length].id;
      const variante = variantes.rows[i % variantes.rows.length];
      const unitPrice = parseFloat(variante.sale_price);
      const quantity = 1;
      const subtotal = unitPrice * quantity;
      const tax = 0; // Sin impuesto
      
      const sale = await client.query(
        'INSERT INTO sales (customer_id, subtotal, tax, total, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [clienteId, subtotal, tax, subtotal, 'completed']
      );
      console.log('Venta creada:', sale.rows[0].id);
      
      await client.query(
        'INSERT INTO sale_details (sale_id, variant_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [sale.rows[0].id, variante.id, quantity, unitPrice, subtotal]
      );
    }
    
    await client.query("INSERT INTO expenses (description, amount, expense_date) VALUES ('Alquiler local', 1500, CURRENT_DATE)");
    await client.query("INSERT INTO expenses (description, amount, expense_date) VALUES ('Servicios', 300, CURRENT_DATE)");
    
    console.log('Ventas y gastos creados exitosamente!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    process.exit();
  }
})();
