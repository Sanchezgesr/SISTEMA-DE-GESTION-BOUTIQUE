const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('[GET_ALL_CUSTOMERS_ERROR]', err);
    res.status(500).json({ message: 'Error al obtener clientes: ' + err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener cliente: ' + err.message });
  }
};

exports.create = async (req, res) => {
  const { name, document_type, document_number, phone, email } = req.body;
  
  if (!name || !document_number) {
    return res.status(400).json({ message: 'Nombre y Número de documento son obligatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO customers (name, document_type, document_number, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, document_type || 'DNI', document_number, phone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[CREATE_CUSTOMER_ERROR]', err);
    if (err.code === '23505') {
       return res.status(400).json({ message: 'El número de documento ya está registrado' });
    }
    res.status(500).json({ message: 'Error de base de datos al crear: ' + err.message });
  }
};

exports.update = async (req, res) => {
  const { name, document_type, document_number, phone, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE customers SET name = $1, document_type = $2, document_number = $3, phone = $4, email = $5 WHERE id = $6 RETURNING *',
      [name, document_type, document_number, phone, email, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error de base de datos al actualizar: ' + err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ message: 'Error de base de datos al eliminar: ' + err.message });
  }
};

exports.consultarDni = async (req, res) => {
  const { dni } = req.params;
  
  if (!dni || dni.length !== 8) {
    return res.status(400).json({ message: 'DNI inválido, debe tener 8 dígitos' });
  }

  try {
    // 1. Buscar en base de datos local primero
    const local = await pool.query('SELECT * FROM customers WHERE document_number = $1', [dni]);
    if (local.rows.length > 0) {
      return res.json({ source: 'local', data: local.rows[0] });
    }

    // 2. Si no está local, consultar API externa (Simulación RENIEC)
    // NOTA PARA EL USUARIO: Para usar una API real como apis.net.pe, 
    // reemplaza este bloque con una petición axios.get(...) usando tu token.
    
    // MOCK RESPONSE
    const mockNames = ['Carlos Alberto Sánchez', 'María Fernanda Ruiz', 'José Luis García', 'Ana Lucía Torres'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)] + ' (Simulado)';
    
    const mockData = {
      name: randomName,
      document_type: 'DNI',
      document_number: dni,
      source: 'reniec'
    };

    res.json({ source: 'reniec', data: mockData });
  } catch (err) {
    res.status(500).json({ message: 'Error en consulta: ' + err.message });
  }
};
exports.consultarRuc = async (req, res) => {
  const { ruc } = req.params;
  
  if (!ruc || ruc.length !== 11) {
    return res.status(400).json({ message: 'RUC inválido, debe tener 11 dígitos' });
  }

  try {
    const local = await pool.query('SELECT * FROM customers WHERE document_number = $1', [ruc]);
    if (local.rows.length > 0) {
      return res.json({ source: 'local', data: local.rows[0] });
    }

    const mockBusinessNames = ['BOUTIQUE FASHION SAC', 'TEXTILES DEL PERU EIRL', 'MODA URBANA S.A.C.', 'ESTILO Y CLASE PERU'];
    const randomName = mockBusinessNames[Math.floor(Math.random() * mockBusinessNames.length)] + ' (Simulado)';
    
    const mockData = {
      name: randomName,
      document_type: 'RUC',
      document_number: ruc,
      address: 'AV. LARCO 123, MIRAFLORES, LIMA',
      source: 'sunat'
    };

    res.json({ source: 'sunat', data: mockData });
  } catch (err) {
    res.status(500).json({ message: 'Error en consulta: ' + err.message });
  }
};
