const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.db');
const migrationsDir = path.join(__dirname, '..', 'migrations');

if (!fs.existsSync(migrationsDir)) {
  console.error('Migrations folder not found:', migrationsDir);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

function applyMigrations(){
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, run_on DATETIME DEFAULT CURRENT_TIMESTAMP)");
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    let i = 0;
    function next(){
      if(i >= files.length){
        console.log('Migrations complete');
        db.close();
        return;
      }
      const file = files[i++];
      db.get('SELECT name FROM migrations WHERE name = ?', [file], (err, row) => {
        if (err) { console.error(err); process.exit(1); }
        if (row) { console.log(`Skipping ${file} (already applied)`); return next(); }
        console.log(`Applying ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        db.exec(sql, (err2) => {
          if (err2) { console.error(`Failed ${file}:`, err2); process.exit(1); }
          db.run('INSERT INTO migrations (name) VALUES (?)', [file], (e) => {
            if (e) { console.error(e); process.exit(1); }
            console.log(`Applied ${file}`);
            next();
          });
        });
      });
    }

    next();
  });
}

applyMigrations();
