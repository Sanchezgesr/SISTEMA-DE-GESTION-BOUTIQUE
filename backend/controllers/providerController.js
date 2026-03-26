const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM providers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Provider not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  const { name, contact, phone, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO providers (name, contact, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, contact, phone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.update = async (req, res) => {
  const { name, contact, phone, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE providers SET name = $1, contact = $2, phone = $3, email = $4 WHERE id = $5 RETURNING *',
      [name, contact, phone, email, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Provider not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM providers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Provider not found' });
    res.json({ message: 'Provider deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
