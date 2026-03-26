const pool = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('--- Creando Categorías ---');
    const catRes = await client.query(`
      INSERT INTO categories (name, description) VALUES 
      ('Camisas', 'Camisas de vestir y casuales'),
      ('Pantalones', 'Jeans, chinos y pantalones de vestir'),
      ('Vestidos', 'Vestidos de gala y casuales'),
      ('Accesorios', 'Correas, relojes y joyería')
      RETURNING id, name
    `);
    const cats = catRes.rows;
    const catCamisas = cats.find(c => c.name === 'Camisas').id;
    const catPantalones = cats.find(c => c.name === 'Pantalones').id;

    console.log('--- Creando Productos ---');
    // Producto 1: Camisa Oxford
    const prod1 = await client.query(
      'INSERT INTO products (name, category_id, cost_price, sale_price, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Camisa Oxford Premium', catCamisas, 45.00, 89.90, 'Camisa 100% algodón de alta calidad']
    );
    const p1Id = prod1.rows[0].id;

    await client.query(`
      INSERT INTO product_variants (product_id, size, color, stock, sku) VALUES 
      (${p1Id}, 'S', 'Blanco', 10, 'CAM-OXF-WHT-S'),
      (${p1Id}, 'M', 'Blanco', 15, 'CAM-OXF-WHT-M'),
      (${p1Id}, 'L', 'Blanco', 8, 'CAM-OXF-WHT-L'),
      (${p1Id}, 'M', 'Celeste', 12, 'CAM-OXF-BLU-M')
    `);

    // Producto 2: Jean Slim Fit
    const prod2 = await client.query(
      'INSERT INTO products (name, category_id, cost_price, sale_price, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Jean Slim Fit Indigo', catPantalones, 60.00, 129.00, 'Jean elástico con lavado moderno']
    );
    const p2Id = prod2.rows[0].id;

    await client.query(`
      INSERT INTO product_variants (product_id, size, color, stock, sku) VALUES 
      (${p2Id}, '30', 'Azul', 5, 'JNS-SLM-BLU-30'),
      (${p2Id}, '32', 'Azul', 10, 'JNS-SLM-BLU-32'),
      (${p2Id}, '34', 'Azul', 7, 'JNS-SLM-BLU-34'),
      (${p2Id}, '32', 'Negro', 8, 'JNS-SLM-BLK-32')
    `);

    console.log('--- Creando Clientes de Prueba ---');
    await client.query(`
      INSERT INTO customers (name, document_type, document_number, phone, email) VALUES 
      ('Juan Pérez', 'DNI', '77889900', '987654321', 'juan@email.com'),
      ('Empresa Textil SAC', 'RUC', '20102030401', '01-445566', 'contacto@textil.pe')
    `);

    await client.query('COMMIT');
    console.log('✅ Base de datos poblada con éxito.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Error en el seeding:', e.message);
  } finally {
    client.release();
    process.exit();
  }
}

seed();
