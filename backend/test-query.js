const pool = require('./db');

pool.query(`
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
`).then(r => console.log('QUERY RESULT:', r.rows))
  .catch(e => console.error('QUERY ERROR:', e))
  .finally(() => process.exit(0));
