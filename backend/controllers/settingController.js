const pool = require('../db');

exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings ORDER BY id LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateSettings = async (req, res) => {
  const { shop_name, currency, tax_rate, logo } = req.body;
  try {
    const checkRes = await pool.query('SELECT id FROM settings ORDER BY id LIMIT 1');
    if (checkRes.rows.length > 0) {
       const result = await pool.query(
         'UPDATE settings SET shop_name = $1, currency = $2, tax_rate = $3, logo = $4 WHERE id = $5 RETURNING *',
         [shop_name, currency, tax_rate, logo, checkRes.rows[0].id]
       );
       res.json(result.rows[0]);
    } else {
       const result = await pool.query(
         'INSERT INTO settings (shop_name, currency, tax_rate, logo) VALUES ($1, $2, $3, $4) RETURNING *',
         [shop_name, currency, tax_rate, logo]
       );
       res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
