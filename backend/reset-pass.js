const pool = require('./db');
const bcrypt = require('bcryptjs');

async function reset() {
  const hash = await bcrypt.hash('admin', 10);
  try {
    const res = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = 'admin@boutique.com' RETURNING id",
      [hash]
    );
    if (res.rowCount === 0) {
      console.log('User not found, inserting...');
      await pool.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@boutique.com', $1, 'admin')",
        [hash]
      );
    }
    console.log('Password reset to: admin');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reset();
