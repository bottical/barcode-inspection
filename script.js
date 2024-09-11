let pickingData = [];
let currentIndex = 0;
let currentCheckedBarcodes = [];

// CSV読み込み
function loadCSV() {
  const fileInput = document.getElementById('csvFileInput');
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = text.split('\n').slice(1).map(row => row.split(',')); // ヘッダー行を無視して2行目から処理

    pickingData = rows.reduce((acc, row) => {
      const pickingNo = row[19]; // ピッキングNO
      const customerName = row[6]; // 出荷先名
      const productName = row[10]; // 商品名
      const quantity = row[13]; // 出荷引当数
      const barcode = row[82]; // 83列目のバーコード

      if (!acc[pickingNo]) {
        acc[pickingNo] = { customerName, items: [] };
      }
      acc[pickingNo].items.push({ productName, quantity, barcode, checked: false });

      return acc;
    }, {});

    renderPickingList();
  };

  reader.readAsText(fileInput.files[0], 'UTF-8');
}

// バーコード検品機能
function checkBarcode() {
  const barcodeInput = document.getElementById('barcodeInput').value.trim();
  const errorMessage = document.getElementById('errorMessage');
  const pickingNo = Object.keys(pickingData)[currentIndex];
  const pickingInfo = pickingData[pickingNo];

  let found = false;

  // 現在のピッキングリスト内でバーコードをチェック
  pickingInfo.items.forEach(item => {
    if (item.barcode === barcodeInput && !item.checked) {
      item.checked = true;
      found = true;
    }
  });

  // 結果によって表示を更新
  if (found) {
    errorMessage.textContent = "";
    document.getElementById('barcodeInput').value = "";
    renderPickingList(); // 更新
    checkIfComplete(); // 完了チェック
  } else {
    errorMessage.textContent = "バーコードが見つかりませんでした。";
  }
}

// ピッキングリストを1ページごとに表示
function renderPickingList() {
  const pickingListElement = document.getElementById('pickingList');
  pickingListElement.innerHTML = '';

  const pickingKeys = Object.keys(pickingData);
  if (pickingKeys.length === 0) return;

  const pickingNo = pickingKeys[currentIndex];
  const pickingInfo = pickingData[pickingNo];
  
  const pickingDiv = document.createElement('div');
  pickingDiv.className = 'list';

  const pickingHeader = `
    <div class="list-header">
      <div>
        <h2>ピッキングNO: <span class="highlight">${pickingNo}</span></h2>
        <p>購入者: ${pickingInfo.customerName}</p>
      </div>
      <div>${currentIndex + 1} / ${pickingKeys.length}</div>
    </div>
  `;
  
  const itemList = pickingInfo.items.map(item => `
    <li class="item ${item.checked ? 'checked' : ''}">
      <span>${item.productName}</span>
      <span class="barcode">${item.barcode}</span>
      <span class="quantity">${item.quantity}</span>
    </li>
  `).join('');

  pickingDiv.innerHTML = pickingHeader + `<ul class="item-list">${itemList}</ul>`;
  pickingListElement.appendChild(pickingDiv);

  document.getElementById('prevButton').disabled = currentIndex === 0;
  document.getElementById('nextButton').disabled = currentIndex === pickingKeys.length - 1;
}

// 全てのバーコードが検品されたかチェック
function checkIfComplete() {
  const pickingNo = Object.keys(pickingData)[currentIndex];
  const pickingInfo = pickingData[pickingNo];

  const allChecked = pickingInfo.items.every(item => item.checked);
  if (allChecked) {
    setTimeout(() => {
      alert('検品完了！次のピッキングNoに移行します。');
      next();
    }, 500);
  }
}

function previous() {
  if (currentIndex > 0) {
    currentIndex--;
    renderPickingList();
  }
}

function next() {
  if (currentIndex < Object.keys(pickingData).length - 1) {
    currentIndex++;
    renderPickingList();
  }
}
