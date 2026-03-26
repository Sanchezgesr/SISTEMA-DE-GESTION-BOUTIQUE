const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./db');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Limpiar tablas (Opcional, ten cuidado)
    // await client.query('TRUNCATE product_variants, sale_details, sales, products, categories, providers RESTART IDENTITY CASCADE');

    console.log('Inserting Categories...');
    const categories = ['Jeans', 'Polos', 'Vestidos', 'Casacas', 'Blusas'];
    const catIds = [];
    for (const name of categories) {
      const res = await client.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id', [name, `Categoría de ${name}`]);
      catIds.push(res.rows[0].id);
    }

    console.log('Inserting Providers...');
    const providers = [
      { name: 'Gamarra Jeans SAC', contact: 'Juan Pérez', phone: '987654321' },
      { name: 'Modas Import Perú', contact: 'María García', phone: '912345678' }
    ];
    const provIds = [];
    for (const p of providers) {
      const res = await client.query('INSERT INTO providers (name, contact, phone) VALUES ($1, $2, $3) RETURNING id', [p.name, p.contact, p.phone]);
      provIds.push(res.rows[0].id);
    }

    const boutiqueProducts = [
      { name: 'Jean Slim Fit Azul', cat: 0, cost: 45, sale: 89, sizes: ['28', '30', '32', '34'], colors: ['Azul Clásico', 'Azul Oscuro'] },
      { name: 'Polo Oversize Algodón', cat: 1, cost: 20, sale: 45, sizes: ['S', 'M', 'L'], colors: ['Blanco', 'Negro', 'Beige'] },
      { name: 'Vestido Floral Verano', cat: 2, cost: 60, sale: 120, sizes: ['S', 'M'], colors: ['Rojo', 'Azul'] },
      { name: 'Casaca Denim Vintage', cat: 3, cost: 75, sale: 159, sizes: ['M', 'L', 'XL'], colors: ['Celeste'] },
      { name: 'Blusa Seda Elegante', cat: 4, cost: 35, sale: 79, sizes: ['S', 'M', 'L'], colors: ['Blanco', 'Rosa', 'Verde'] }
    ];

    console.log('Inserting Products and Variants...');
    for (const p of boutiqueProducts) {
      const resProd = await client.query(
        'INSERT INTO products (name, category_id, provider_id, cost_price, sale_price, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [p.name, catIds[p.cat], provIds[0], p.cost, p.sale, `Excelente calidad de ${p.name}`]
      );
      const productId = resProd.rows[0].id;

      for (const color of p.colors) {
        for (const size of p.sizes) {
          const stock = Math.floor(Math.random() * 20) + 5;
          const sku = `${p.name.substring(0,3).toUpperCase()}-${size}-${color.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
          await client.query(
            'INSERT INTO product_variants (product_id, size, color, stock, sku) VALUES ($1, $2, $3, $4, $5)',
            [productId, size, color, stock, sku]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log('¡Base de datos poblada con éxito!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding data:', err);
  } finally {
    client.release();
    process.exit();
  }
};

seed();
