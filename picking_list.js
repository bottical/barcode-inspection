let pickingData = []; // ピッキングデータの配列
let currentIndex = 0; // 現在表示中のピッキング番号のインデックス

// Firestoreからデータを取得
function loadPickingList() {
  const urlParams = new URLSearchParams(window.location.search);
  const csvId = urlParams.get('id'); // "id"というパラメータを取得

  // csvIdが存在しない場合、エラーメッセージを表示して処理を中断
  if (!csvId) {
    console.error("idが空です。URLに正しいIDが含まれているか確認してください。");
    return;
  }

  const docRef = db.collection('pickingLists').doc(csvId);
  
  docRef.get().then((doc) => {
    if (doc.exists) {
      console.log("データ:", doc.data());
      pickingData = doc.data(); // 取得したデータをグローバル変数に格納
      renderPickingList(); // ピッキングリストをレンダリング
    } else {
      console.log("指定されたピッキングリストが存在しません。");
    }
  }).catch((error) => {
    console.error("エラー:", error);
  });
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
      item.checked = true; // 検品完了をマーク
      found = true;
    }
  });

  // 結果によって表示を更新
  if (found) {
    errorMessage.textContent = "";
    document.getElementById('barcodeInput').value = "";
    renderPickingList(); // 更新
    checkIfComplete(); // 検品完了か確認
  } else {
    errorMessage.textContent = "バーコードが見つかりませんでした。";
  }
}

// ピッキングリストを1ページごとに表示
function renderPickingList() {
  const pickingListElement = document.getElementById('pickingList');
  pickingListElement.innerHTML = ''; // 前の内容をクリア

  const pickingKeys = Object.keys(pickingData);
  if (pickingKeys.length === 0) return; // データがない場合は終了

  const pickingNo = pickingKeys[currentIndex];
  const pickingInfo = pickingData[pickingNo];
  
  // itemsが存在しない場合の処理
  if (!pickingInfo || !pickingInfo.items) {
    console.error('ピッキングデータにアイテムが存在しません');
    return;
  }

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

// ページロード時にFirestoreからピッキングリストを読み込む
window.onload = loadPickingList;
