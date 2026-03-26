const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const query = `
      SELECT p.*, c.name as category_name, pr.name as provider_name,
      COALESCE(
        json_agg(
          json_build_object(
            'id', v.id,
            'size', v.size,
            'color', v.color,
            'stock', v.stock,
            'sku', v.sku
          )
        ) FILTER (WHERE v.id IS NOT NULL), '[]'
      ) as variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN providers pr ON p.provider_id = pr.id
      LEFT JOIN product_variants v ON p.id = v.product_id
      GROUP BY p.id, c.name, pr.name
      ORDER BY p.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const productRes = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (productRes.rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    
    const variantsRes = await pool.query('SELECT * FROM product_variants WHERE product_id = $1', [req.params.id]);
    
    res.json({
      ...productRes.rows[0],
      variants: variantsRes.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  const { name, category_id, provider_id, cost_price, sale_price, description, variants } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const prodRes = await client.query(
      `INSERT INTO products (name, category_id, provider_id, cost_price, sale_price, description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, category_id, provider_id, cost_price, sale_price, description]
    );
    const productId = prodRes.rows[0].id;

    if (variants && variants.length > 0) {
      for (let v of variants) {
        await client.query(
          `INSERT INTO product_variants (product_id, size, color, stock, sku) 
           VALUES ($1, $2, $3, $4, $5)`,
          [productId, v.size, v.color, v.stock || 0, v.sku]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ ...prodRes.rows[0], variants });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Error al crear producto con variantes' });
  } finally {
    client.release();
  }
};

exports.update = async (req, res) => {
  const { name, category_id, provider_id, cost_price, sale_price, description, variants } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Actualizar datos base del producto
    const prodRes = await client.query(
      `UPDATE products 
       SET name = $1, category_id = $2, provider_id = $3, cost_price = $4, sale_price = $5, description = $6 
       WHERE id = $7 RETURNING *`,
      [name, category_id, provider_id, cost_price, sale_price, description, req.params.id]
    );

    if (prodRes.rows.length === 0) throw new Error('Producto no encontrado');

    // 2. Gestionar Variantes
    if (variants && variants.length > 0) {
      // Obtenemos IDs de variantes actuales que vienen en el request
      const incomingVariantIds = variants.filter(v => v.id).map(v => v.id);
      
      // (Opcional) Eliminar variantes que ya no están en el nuevo listado 
      // y no tienen referencias (o simplemente no eliminarlas para evitar errores de FK)
      // Por ahora, solo añadiremos o actualizaremos las que vienen.

      for (let v of variants) {
        if (v.id) {
          // Actualizar variante existente
          await client.query(
            `UPDATE product_variants SET size = $1, color = $2, stock = $3, sku = $4 WHERE id = $5 AND product_id = $6`,
            [v.size, v.color, v.stock, v.sku, v.id, req.params.id]
          );
        } else {
          // Insertar nueva variante
          await client.query(
            `INSERT INTO product_variants (product_id, size, color, stock, sku) VALUES ($1, $2, $3, $4, $5)`,
            [req.params.id, v.size, v.color, v.stock || 0, v.sku]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Producto y variantes actualizados con éxito' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[UPDATE_PRODUCT_ERROR]', err.message);
    res.status(500).json({ message: err.message || 'Error al actualizar el producto' });
  } finally {
    client.release();
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
