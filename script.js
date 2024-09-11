let pickingData = [];

// CSV読み込み
function loadCSV() {
  const fileInput = document.getElementById('csvFileInput');
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = text.split('\n').map(row => row.split(','));
    
    pickingData = rows.reduce((acc, row) => {
      const pickingNo = row[19]; // ピッキングNO
      const customerName = row[6]; // 出荷先名
      const productName = row[10]; // 商品名
      const quantity = row[13]; // 出荷引当数

      if (!acc[pickingNo]) {
        acc[pickingNo] = { customerName, items: [] };
      }
      acc[pickingNo].items.push({ productName, quantity });

      return acc;
    }, {});

    renderPickingList();
  };

  reader.readAsText(fileInput.files[0], 'UTF-8');
}

function renderPickingList() {
  const pickingListElement = document.getElementById('pickingList');
  pickingListElement.innerHTML = '';

  Object.keys(pickingData).forEach(pickingNo => {
    const pickingInfo = pickingData[pickingNo];
    const pickingDiv = document.createElement('div');
    pickingDiv.className = 'list';

    const pickingHeader = `
      <div class="list-header">
        <div>
          <h2>ピッキングNO: <span class="highlight">${pickingNo}</span></h2>
          <p>購入者: ${pickingInfo.customerName}</p>
        </div>
      </div>
    `;
    
    const itemList = pickingInfo.items.map(item => `
      <li class="item">
        <span>${item.productName}</span><span class="highlight">${item.quantity}</span>
      </li>
    `).join('');

    pickingDiv.innerHTML = pickingHeader + `<ul class="item-list">${itemList}</ul>`;
    pickingListElement.appendChild(pickingDiv);
  });
}
