const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT,
    quantity INTEGER DEFAULT 0,
    location TEXT,
    category TEXT,
    supplier TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/items', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.max(1, parseInt(req.query.pageSize) || 10);
  const search = req.query.search ? `%${req.query.search}%` : '%';
  let sort = req.query.sort || 'created_at:desc';
  const [sortKey, sortDir] = sort.split(':');
  const allowedKeys = ['id', 'name', 'quantity', 'location', 'category', 'supplier', 'created_at'];
  const key = allowedKeys.includes(sortKey) ? sortKey : 'created_at';
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * pageSize;
  const filterQuery = 'name LIKE ? OR sku LIKE ? OR location LIKE ? OR category LIKE ? OR supplier LIKE ?';
  const queryParams = [search, search, search, search, search];

  const metaSql = `SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as totalQuantity, SUM(CASE WHEN quantity < 20 THEN 1 ELSE 0 END) as lowStockCount, COUNT(DISTINCT supplier) as supplierCount FROM items WHERE ${filterQuery}`;
  db.get(metaSql, queryParams, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const total = row.count || 0;
    const totalQuantity = row.totalQuantity || 0;
    const lowStockCount = row.lowStockCount || 0;
    const supplierCount = row.supplierCount || 0;
    const sql = `SELECT * FROM items WHERE ${filterQuery} ORDER BY ${key} ${dir} LIMIT ? OFFSET ?`;
    db.all(sql, queryParams.concat([pageSize, offset]), (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ items: rows, total, totalQuantity, lowStockCount, supplierCount });
    });
  });
});

app.post('/api/items', (req, res) => {
  const { name, sku, quantity, location, category, supplier } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const qty = Number(quantity) || 0;
  db.run('INSERT INTO items (name, sku, quantity, location, category, supplier) VALUES (?, ?, ?, ?, ?, ?)', [name, sku || '', qty, location || '', category || '', supplier || ''], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, sku: sku || '', quantity: qty, location: location || '', category: category || '', supplier: supplier || '' });
  });
});

app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const { name, sku, quantity, location, category, supplier } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const qty = Number(quantity) || 0;
  db.run('UPDATE items SET name = ?, sku = ?, quantity = ?, location = ?, category = ?, supplier = ? WHERE id = ?', [name, sku || '', qty, location || '', category || '', supplier || '', id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ id: Number(id), name, sku: sku || '', quantity: qty, location: location || '', category: category || '', supplier: supplier || '' });
  });
});

app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM items WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
});

app.get('/api/export', (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : '%';
  let sort = req.query.sort || 'created_at:desc';
  const [sortKey, sortDir] = sort.split(':');
  const allowedKeys = ['id', 'name', 'quantity', 'location', 'category', 'supplier', 'created_at'];
  const key = allowedKeys.includes(sortKey) ? sortKey : 'created_at';
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
  const filterQuery = 'name LIKE ? OR sku LIKE ? OR location LIKE ? OR category LIKE ? OR supplier LIKE ?';
  const searchParams = [search, search, search, search, search];
  const sql = `SELECT * FROM items WHERE ${filterQuery} ORDER BY ${key} ${dir}`;
  db.all(sql, searchParams, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csvRows = [
      ['ID', 'Name', 'SKU', 'Qty', 'Location', 'Category', 'Supplier', 'Created At'],
      ...rows.map(item => [
        item.id,
        item.name,
        item.sku || '',
        item.quantity ?? 0,
        item.location || '',
        item.category || '',
        item.supplier || '',
        item.created_at || ''
      ])
    ];
    const csv = csvRows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="warehouse-items.csv"');
    res.send(csv);
  });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
