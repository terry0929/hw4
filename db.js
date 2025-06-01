// db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./bento.db', (err) => {
    if (err) {
        console.error("❌ 資料庫連線失敗：", err.message);
    } else {
        console.log("✅ 已成功連接 SQLite 資料庫");
    }
});

module.exports = db;
