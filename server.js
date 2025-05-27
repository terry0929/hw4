const express = require('express');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

// 靜態前端頁面
app.use(express.static('public'));

// 連線資料庫
const db = new sqlite3.Database('./bento.db');

// 建立資料表（第一次執行會建立）
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch TEXT,
      shop_name TEXT,
      location TEXT,
      service_time TEXT,
      phone TEXT
    )
  `);

    // 讀入 JSON 並匯入（只做一次）
    const data = JSON.parse(fs.readFileSync('./臺鐵便當自營販賣點.json', 'utf-8'));
    data.forEach(branch => {
        const branchName = branch.restaurantName;
        branch.pmsBentoShop.forEach(shop => {
            db.run(`
        INSERT INTO shops (branch, shop_name, location, service_time, phone)
        VALUES (?, ?, ?, ?, ?)
      `, [
                branchName,
                shop.shopName || '',
                shop.location || '',
                shop.serviceTime || '',
                shop.tel || ''
            ]);
        });
    });
});

// 所有據點
app.get('/shops', (req, res) => {
    db.all("SELECT * FROM shops", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 搜尋據點
app.get('/shops/search', (req, res) => {
    const keyword = `%${req.query.query || ''}%`;
    db.all(`
    SELECT * FROM shops
    WHERE branch LIKE ? OR shop_name LIKE ? OR location LIKE ?
  `, [keyword, keyword, keyword], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 伺服器啟動於 http://localhost:${PORT}`);
});
