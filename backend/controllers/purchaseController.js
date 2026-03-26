const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, pr.name as provider_name, u.name as user_name 
      FROM purchases p
      LEFT JOIN providers pr ON p.provider_id = pr.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const purchase = await pool.query('SELECT * FROM purchases WHERE id = $1', [req.params.id]);
    if (purchase.rows.length === 0) return res.status(404).json({ message: 'Purchase not found' });
    
    const details = await pool.query(`
      SELECT pd.*, pr.name as product_name 
      FROM purchase_details pd 
      JOIN products pr ON pd.product_id = pr.id 
      WHERE pd.purchase_id = $1
    `, [req.params.id]);
    
    res.json({
      ...purchase.rows[0],
      details: details.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  const { provider_id, total, items } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const purchaseRes = await client.query(
      'INSERT INTO purchases (user_id, provider_id, total) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, provider_id, total]
    );
    const purchaseId = purchaseRes.rows[0].id;

    for (let item of items) {
      await client.query(
        'INSERT INTO purchase_details (purchase_id, product_id, quantity, unit_cost, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [purchaseId, item.product_id, item.quantity, item.unit_cost, item.subtotal]
      );
      await client.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json({ message: 'Purchase recorded successfully', purchase_id: purchaseId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Transaction Failed' });
  } finally {
    client.release();
  }
};
