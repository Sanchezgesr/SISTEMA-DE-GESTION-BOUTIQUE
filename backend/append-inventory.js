const pool = require('./db');

async function appendInventory() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('--- Insertando Nuevas Categorías (Si no existen) ---');

    const newCats = [
      { name: 'Abrigos', desc: 'Abrigos y ropa de invierno' },
      { name: 'Lencería', desc: 'Lencería fina y ropa interior' },
      { name: 'Básicos', desc: 'Ropa básica para el día a día' },
      { name: 'Calzado', desc: 'Zapatos, zapatillas y tacones' },
      { name: 'Carteras', desc: 'Bolsos y carteras de cuero' }
    ];

    const catMap = {};
    for (const cat of newCats) {
      // Intentar buscarla
      let res = await client.query('SELECT id FROM categories WHERE name = $1', [cat.name]);
      if (res.rows.length === 0) {
        res = await client.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id', [cat.name, cat.desc]);
      }
      catMap[cat.name] = res.rows[0].id;
    }

    // Asegurarnos de tener las antiguas también
    let resBaseCats = await client.query('SELECT id, name FROM categories');
    resBaseCats.rows.forEach(r => catMap[r.name] = r.id);

    console.log('--- Generando Productos de Alta Costura ---');

    const productos = [
      // Vestidos
      { name: 'Vestido de Noche Escarlata', cat: 'Vestidos', cost: 120, sale: 280, desc: 'Elegante vestido largo para eventos de gala.', sizes: ['S', 'M', 'L'], colors: ['Rojo', 'Vino', 'Negro'] },
      { name: 'Vestido Corto Seda', cat: 'Vestidos', cost: 90, sale: 199, desc: 'Vestido casual y elegante de seda ligera.', sizes: ['XS', 'S', 'M'], colors: ['Blanco', 'Crema', 'Esmeralda'] },
      
      // Abrigos
      { name: 'Abrigo Duster de Lana', cat: 'Abrigos', cost: 150, sale: 320, desc: 'Abrigo largo clásico para invierno.', sizes: ['S', 'M', 'L'], colors: ['Camel', 'Gris', 'Negro'] },
      { name: 'Chaqueta Puffer Crop', cat: 'Abrigos', cost: 85, sale: 180, desc: 'Cortavientos estilo puffer corto muy en tendencia.', sizes: ['S', 'M', 'L'], colors: ['Rosa Pastel', 'Blanco', 'Plata'] },

      // Pantalones
      { name: 'Pantalón Palazo Lino', cat: 'Pantalones', cost: 65, sale: 145, desc: 'Pantalón holgado muy cómodo y fresco.', sizes: ['S', 'M', 'L', 'XL'], colors: ['Beige', 'Blanco', 'Terracota'] },
      { name: 'Jeans Wide Leg Tiro Alto', cat: 'Pantalones', cost: 55, sale: 139, desc: 'Denim grueso de excelente estructura corporal.', sizes: ['28', '30', '32'], colors: ['Celeste', 'Azul Clásico', 'Negro'] },

      // Blusas y Camisas (Usaremos Básicos o Camisas)
      { name: 'Blusa Satén Cuello V', cat: 'Camisas', cost: 45, sale: 95, desc: 'Ideal para la oficina y reuniones casuales.', sizes: ['S', 'M', 'L'], colors: ['Blanco', 'Dorado', 'Negro', 'Celeste'] },
      { name: 'Top Corset Moderno', cat: 'Básicos', cost: 50, sale: 110, desc: 'Top ajustado estilo corset romántico.', sizes: ['XS', 'S', 'M'], colors: ['Negro', 'Vino', 'Marfil'] },

      // Carteras
      { name: 'Bolso Tote Monograma', cat: 'Carteras', cost: 130, sale: 299, desc: 'Amplia cartera tote para el día a día.', sizes: ['Única'], colors: ['Marrón', 'Negro'] },
      { name: 'Mini Bag de Fiesta', cat: 'Carteras', cost: 75, sale: 150, desc: 'Cartera de mano pequeña con detalles metálicos.', sizes: ['Única'], colors: ['Dorado', 'Plata', 'Negro'] },

      // Calzado
      { name: 'Stilettos Clásicos Charol', cat: 'Calzado', cost: 95, sale: 220, desc: 'Zapatos de tacón alto ideales para vestidos de noche.', sizes: ['36', '37', '38', '39'], colors: ['Nude', 'Rojo', 'Negro'] },
      { name: 'Botines de Cuero Chelsea', cat: 'Calzado', cost: 125, sale: 279, desc: 'Botines sin cordón muy cómodos para climas fríos.', sizes: ['36', '37', '38', '39'], colors: ['Marrón', 'Negro'] }
    ];

    let appendedCount = 0;

    for (const p of productos) {
      const catId = catMap[p.cat] || Object.values(catMap)[0]; // Fallback a la primera categoría

      // Insertar Producto
      const prodRes = await client.query(
        'INSERT INTO products (name, category_id, cost_price, sale_price, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [p.name, catId, p.cost, p.sale, p.desc]
      );
      const productId = prodRes.rows[0].id;

      // Generar Variantes (multiplicar tallas por colores)
      for (const size of p.sizes) {
        for (const color of p.colors) {
          const stock = Math.floor(Math.random() * 10) + 5; // Stock entre 5 y 14
          const refCode = p.name.substring(0, 3).toUpperCase().replace(/\s/g, '');
          const sku = `${refCode}-${size.substring(0, 2).toUpperCase()}-${color.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`;
          
          await client.query(
            'INSERT INTO product_variants (product_id, size, color, stock, sku) VALUES ($1, $2, $3, $4, $5)',
            [productId, size, color, stock, sku]
          );
          appendedCount++;
        }
      }
    }

    await client.query('COMMIT');
    console.log(`✅ ¡Éxito! Se inyectaron ${appendedCount} nuevas piezas de inventario al sistema.`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error inyectando inventario:', err.message);
  } finally {
    client.release();
    process.exit();
  }
}

appendInventory();
