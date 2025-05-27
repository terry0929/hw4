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
            document.getElementById("results").innerHTML = "<p>❌ 無法取得資料，請稍後再試。</p>";
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

// 預設載入全部據點
window.onload = () => {
    searchShops();
};
