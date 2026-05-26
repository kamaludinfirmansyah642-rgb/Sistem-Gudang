const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.db');
const force = process.argv.includes('--force') || process.env.SEED_FORCE === '1';

const sample = [
  { name: 'Box Pallet', sku: 'WH-1001', quantity: 45, location: 'A1', category: 'Logistik', supplier: 'Sigma Parts' },
  { name: 'Forklift Battery', sku: 'WH-1002', quantity: 12, location: 'B3', category: 'Energi', supplier: 'PowerMax' },
  { name: 'Safety Helmet', sku: 'WH-1003', quantity: 100, location: 'C2', category: 'Keselamatan', supplier: 'SafeWear' },
  { name: 'Packing Tape', sku: 'WH-1004', quantity: 230, location: 'D1', category: 'Kemasan', supplier: 'PackRight' },
  { name: 'Pallet Wrap', sku: 'WH-1005', quantity: 160, location: 'B1', category: 'Kemasan', supplier: 'WrapCo' },
  { name: 'Shipping Labels', sku: 'WH-1006', quantity: 310, location: 'C5', category: 'Administrasi', supplier: 'LabelPro' },
  { name: 'Steel Shelves', sku: 'WH-1007', quantity: 20, location: 'A5', category: 'Peralatan', supplier: 'WarehousePro' },
  { name: 'Loading Ramp', sku: 'WH-1008', quantity: 8, location: 'D4', category: 'Peralatan', supplier: 'RampTech' },
  { name: 'Hand Truck', sku: 'WH-1009', quantity: 14, location: 'A3', category: 'Peralatan', supplier: 'MoverInc' },
  { name: 'Safety Gloves', sku: 'WH-1010', quantity: 220, location: 'C1', category: 'Keselamatan', supplier: 'SafeWear' }
];

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  if (force) {
    console.log('Force seed: clearing `items` table');
    db.run('DELETE FROM items');
  }

  const stmt = db.prepare('INSERT INTO items (name, sku, quantity, location, category, supplier) VALUES (?, ?, ?, ?, ?, ?)');
  sample.forEach(item => stmt.run(item.name, item.sku, item.quantity, item.location, item.category, item.supplier));
  stmt.finalize(() => {
    db.get('SELECT COUNT(*) as c FROM items', (err, row) => {
      if (err) console.error(err);
      else console.log(`Seed complete — total items now: ${row.c}`);
      db.close();
    });
  });
});
