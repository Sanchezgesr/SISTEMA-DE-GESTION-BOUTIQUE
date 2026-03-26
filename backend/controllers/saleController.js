const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.name as customer_name, c.document_number, u.name as user_name 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const sale = await pool.query('SELECT * FROM sales WHERE id = $1', [req.params.id]);
    if (sale.rows.length === 0) return res.status(404).json({ message: 'Venta no encontrada' });
    
    const details = await pool.query(`
      SELECT sd.*, p.name as product_name, v.size, v.color 
      FROM sale_details sd 
      JOIN product_variants v ON sd.variant_id = v.id 
      JOIN products p ON v.product_id = p.id
      WHERE sd.sale_id = $1
    `, [req.params.id]);
    
    res.json({
      ...sale.rows[0],
      details: details.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  const { customer_id, items, payment_method } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let totalCalculado = 0;
    const finalItems = [];

    // Validar cada ítem y calcular totales reales
    for (let item of items) {
      // Obtenemos precio actual y stock físico de la variante
      const resVar = await client.query(`
        SELECT p.sale_price, v.stock, p.name, v.size, v.color 
        FROM product_variants v 
        JOIN products p ON v.product_id = p.id 
        WHERE v.id = $1 FOR UPDATE
      `, [item.variant_id]);

      if (resVar.rows.length === 0) throw new Error(`Producto no encontrado (ID: ${item.variant_id})`);
      
      const productInfo = resVar.rows[0];
      if (productInfo.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${productInfo.name} [Talla: ${productInfo.size}]`);
      }

      const itemSubtotal = parseFloat(productInfo.sale_price) * item.quantity;
      totalCalculado += itemSubtotal;
      
      finalItems.push({
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: productInfo.sale_price,
        subtotal: itemSubtotal
      });
    }

    // Cálculos de impuestos para Perú (IGV 18%)
    const taxRate = 0.18;
    const subtotalGeneral = totalCalculado / (1 + taxRate);
    const taxGeneral = totalCalculado - subtotalGeneral;

    // Registrar Venta
    const saleRes = await client.query(
      'INSERT INTO sales (user_id, customer_id, total, subtotal, tax, payment_method) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.user.id, customer_id || null, totalCalculado, subtotalGeneral, taxGeneral, payment_method || 'efectivo']
    );
    const saleId = saleRes.rows[0].id;

    // Registrar Detalles y Actualizar Stock
    for (let item of finalItems) {
      await client.query(
        'INSERT INTO sale_details (sale_id, variant_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [saleId, item.variant_id, item.quantity, item.unit_price, item.subtotal]
      );
      
      await client.query(
        'UPDATE product_variants SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.variant_id]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json({ 
      message: 'Venta registrada con éxito', 
      sale_id: saleId, 
      total: totalCalculado.toFixed(2),
      igv: taxGeneral.toFixed(2)
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[SALE_ERROR]', err.message);
    res.status(400).json({ message: err.message || 'Error al procesar la venta' });
  } finally {
    client.release();
  }
};

exports.update = async (req, res) => {
  const { customer_id, payment_method, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE sales SET customer_id = $1, payment_method = $2, status = $3 WHERE id = $4 RETURNING *',
      [customer_id || null, payment_method, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Obtener detalles para devolver stock si la venta no estaba ya cancelada
    const saleCheck = await client.query('SELECT status FROM sales WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (saleCheck.rows.length === 0) throw new Error('Venta no encontrada');
    
    if (saleCheck.rows[0].status !== 'cancelled') {
      const details = await client.query('SELECT variant_id, quantity FROM sale_details WHERE sale_id = $1', [req.params.id]);
      for (let item of details.rows) {
        await client.query('UPDATE product_variants SET stock = stock + $1 WHERE id = $2', [item.quantity, item.variant_id]);
      }
    }

    // 2. Eliminar o marcar como cancelada (el usuario pidió "modificar", pero a veces eliminar es lo que buscan)
    // Para reportes, suele ser mejor marcar como 'cancelled' o eliminar físicamente si es error de dedo.
    // Implementaremos ELIMINAR para limpiar el reporte si así lo desean.
    await client.query('DELETE FROM sales WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');
    res.json({ message: 'Venta eliminada y stock restaurado' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};
