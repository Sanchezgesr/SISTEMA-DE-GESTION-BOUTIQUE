const pool = require('../db');
const bcrypt = require('bcryptjs');

// GET all users (admin only)
exports.getAll = async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(result.rows);
};

// POST create user (admin only)
exports.create = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Check duplicate email
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ message: 'El correo ya está registrado' });
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
    [name, email, password_hash, role]
  );
  res.status(201).json(result.rows[0]);
};

// PUT update user (admin only)
exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;

  let query, params;
  if (password && password.trim() !== '') {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    query = 'UPDATE users SET name=$1, email=$2, role=$3, password_hash=$4 WHERE id=$5 RETURNING id, name, email, role';
    params = [name, email, role, password_hash, id];
  } else {
    query = 'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, name, email, role';
    params = [name, email, role, id];
  }

  const result = await pool.query(query, params);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(result.rows[0]);
};

// DELETE user (admin only, cannot delete self)
exports.remove = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
  }
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  res.json({ message: 'Usuario eliminado' });
};
