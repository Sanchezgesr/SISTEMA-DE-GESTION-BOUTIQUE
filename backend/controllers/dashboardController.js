const pool = require('../db');

exports.getKpis = async (req, res) => {
  try {
    const salesTodayRes = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total_sales FROM sales 
      WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelled'
    `);
    
    const customersCountRes = await pool.query('SELECT COUNT(*) as count FROM customers');
    
    const stockCountRes = await pool.query('SELECT COALESCE(SUM(stock), 0) as current_stock FROM product_variants');
    
    const expensesMonthRes = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses 
      WHERE EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const recentSalesRes = await pool.query(`
      SELECT s.id, s.total, s.created_at, s.status, c.name as customer_name 
      FROM sales s 
      LEFT JOIN customers c ON s.customer_id = c.id 
      ORDER BY s.created_at DESC LIMIT 5
    `);

    const lowStockRes = await pool.query(`
      SELECT p.name as product_name, pv.size, pv.color, pv.stock 
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.stock < 5
      ORDER BY pv.stock ASC
    `);

    // Ventas de los últimos 7 días
    const weeklySalesRes = await pool.query(`
      WITH last_7_days AS (
        SELECT current_date - i as date
        FROM generate_series(0, 6) i
      )
      SELECT 
        to_char(d.date, 'TMDay') as day_name,
        COALESCE(SUM(s.total), 0) as ventas
      FROM last_7_days d
      LEFT JOIN sales s ON DATE(s.created_at) = d.date AND s.status != 'cancelled'
      GROUP BY d.date
      ORDER BY d.date ASC
    `);
    
    // Mapeo simple de nombres a abreviaturas si se desea, o usar directo de PostgreSQL
    const daysMap = { 'Monday':'Lun', 'Tuesday':'Mar', 'Wednesday':'Mié', 'Thursday':'Jue', 'Friday':'Vie', 'Saturday':'Sáb', 'Sunday':'Dom', 'lunes':'Lun', 'martes':'Mar', 'miércoles':'Mié', 'jueves':'Jue', 'viernes':'Vie', 'sábado':'Sáb', 'domingo':'Dom' };

    const weekly_sales = weeklySalesRes.rows.map(row => ({
      day: daysMap[row.day_name.trim()] || row.day_name.substring(0,3),
      ventas: parseFloat(row.ventas),
      objetivo: 1000 // Objetivo fijo para demo
    }));

    // Ventas por categoría (Mes actual)
    const categorySalesRes = await pool.query(`
      SELECT c.name, COALESCE(SUM(sd.subtotal), 0) as value
      FROM categories c
      JOIN products p ON p.category_id = c.id
      JOIN product_variants pv ON pv.product_id = p.id
      JOIN sale_details sd ON sd.variant_id = pv.id
      JOIN sales s ON sd.sale_id = s.id
      WHERE EXTRACT(MONTH FROM s.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND s.status != 'cancelled'
      GROUP BY c.id, c.name
      HAVING SUM(sd.subtotal) > 0
      ORDER BY value DESC
    `);

    const colors = ['#1A1A1A', '#DDBB99', '#E8D7D0', '#737373', '#9CA3AF', '#C6A27A'];
    
    let totalCatSales = 0;
    categorySalesRes.rows.forEach(r => totalCatSales += parseFloat(r.value));

    const category_sales = categorySalesRes.rows.map((row, i) => {
      const val = parseFloat(row.value);
      return {
        name: row.name,
        value: val,
        percentage: totalCatSales > 0 ? ((val / totalCatSales) * 100).toFixed(1) : 0,
        color: colors[i % colors.length]
      };
    });

    res.json({
      sales_today: parseFloat(salesTodayRes.rows[0].total_sales),
      total_customers: parseInt(customersCountRes.rows[0].count),
      products_in_stock: parseInt(stockCountRes.rows[0].current_stock),
      monthly_expenses: parseFloat(expensesMonthRes.rows[0].total_expenses),
      recent_sales: recentSalesRes.rows,
      low_stock_alerts: lowStockRes.rows,
      weekly_sales,
      category_sales
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
