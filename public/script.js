function searchShops() {
    const keyword = document.getElementById("searchInput").value;
    const url = keyword ? `/shops/search?query=${encodeURIComponent(keyword)}` : `/shops`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error("發生錯誤：", error);
            document.getElementById("results").innerHTML = "<p>❌ 無法取得資料</p>";
        });
}

function displayResults(data) {
    let html = `
    <table>
      <tr>
        <th>分處</th>
        <th>店名</th>
        <th>位置</th>
        <th>營業時間</th>
        <th>電話</th>
      </tr>
  `;

    data.forEach(shop => {
        html += `
      <tr>
        <td>${shop.branch}</td>
        <td>${shop.shop_name}</td>
        <td>${shop.location}</td>
        <td>${shop.service_time}</td>
        <td>${shop.phone || '-'}</td>
      </tr>
    `;
    });

    html += "</table>";
    document.getElementById("results").innerHTML = html;
}

function addShop() {
    const branch = document.getElementById("branch").value.trim();
    const shop_name = document.getElementById("shop_name").value.trim();
    const location = document.getElementById("location").value.trim();
    const service_time = document.getElementById("service_time").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!branch || !shop_name || !location || !service_time) {
        alert("❗ 分處、店名、位置與營業時間為必填！");
        return;
    }

    const shopData = { branch, shop_name, location, service_time, phone };

    fetch('/shops/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(shopData)
    })
        .then(res => res.json())
        .then(result => {
            alert(result.message);
            if (result.message.includes("成功")) {
                // 清空欄位
                document.getElementById("branch").value = "";
                document.getElementById("shop_name").value = "";
                document.getElementById("location").value = "";
                document.getElementById("service_time").value = "";
                document.getElementById("phone").value = "";
                searchShops(); // 重新載入
            }
        })
        .catch(err => {
            alert("新增失敗");
            console.error("❌ 錯誤詳細：", err);
        });
}



window.onload = () => {
    searchShops();
};

