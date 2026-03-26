const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name as user_name 
      FROM expenses e 
      LEFT JOIN users u ON e.user_id = u.id 
      ORDER BY e.expense_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  const { description, amount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO expenses (user_id, description, amount, expense_date) VALUES ($1, $2, $3, CURRENT_DATE) RETURNING *',
      [req.user?.id || 1, description, amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
