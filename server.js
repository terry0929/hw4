const express = require('express');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json()); // ⬅️ 一定要加這行才能接收 JSON

// 建立 SQLite 連線（包含錯誤提示）
const db = new sqlite3.Database('./bento.db', (err) => {
    if (err) {
        console.error("❌ 資料庫連線失敗：", err.message);
    } else {
        console.log("✅ 已成功連接 SQLite 資料庫");
    }
});

// ✅ 建立資料表（含 UNIQUE 條件）+ 清空資料 + 匯入 JSON
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch TEXT,
      shop_name TEXT,
      location TEXT,
      service_time TEXT,
      phone TEXT,
      UNIQUE(shop_name, location, service_time)
    )
  `);

    db.run("DELETE FROM shops", () => {
        console.log("🧹 已清空資料表");

        const data = JSON.parse(fs.readFileSync('./臺鐵便當自營販賣點.json', 'utf-8'));
        data.forEach(branch => {
            const branchName = branch.restaurantName;
            branch.pmsBentoShop.forEach(shop => {
                db.run(`
          INSERT OR IGNORE INTO shops (branch, shop_name, location, service_time, phone)
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

        console.log("✅ JSON 資料匯入完畢");
    });
});

// ✅ 查詢全部據點
app.get('/shops', (req, res) => {
    db.all("SELECT * FROM shops", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ✅ 模糊搜尋據點
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

// ✅ 新增據點（新增前先檢查是否重複）
app.post('/shops/add', (req, res) => {
    const { branch, shop_name, location, service_time, phone } = req.body;

    if (!branch || !shop_name || !location || !service_time) {
        return res.status(400).json({ message: "❗ 請填寫所有必要欄位！" });
    }

    db.get(`
    SELECT 1 FROM shops
    WHERE shop_name = ? AND location = ? AND service_time = ?
  `, [shop_name, location, service_time], (err, exists) => {
        if (err) {
            console.error("❌ 查詢失敗：", err.message);
            return res.status(500).json({ message: "❌ 查詢錯誤" });
        }

        if (exists) {
            return res.json({ message: "⚠️ 此據點已存在，請勿重複新增。" });
        }

        db.run(`
      INSERT INTO shops (branch, shop_name, location, service_time, phone)
      VALUES (?, ?, ?, ?, ?)
    `, [branch, shop_name, location, service_time, phone], function (err) {
            if (err) {
                console.error("❌ 寫入失敗：", err.message);
                return res.status(500).json({ message: "❌ 新增失敗" });
            }

            res.json({ message: "✅ 新增成功！", id: this.lastID });
        });
    });
});

// ✅ 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 伺服器啟動於 http://localhost:${PORT}`);
});
