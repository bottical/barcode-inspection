let pickingData = []; // ピッキングデータの配列
let currentIndex = 0; // 現在表示中のピッキング番号のインデックス

// URLパラメータからピッキングリストIDを取得する関数
function getPickingListIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Firestoreからデータを取得
function loadPickingList() {
  const pickingListId = getPickingListIdFromURL();
  if (!pickingListId) {
    console.error('ピッキングリストIDが指定されていません。');
    return;
  }

  const docRef = db.collection('csvFiles').doc(pickingListId); // 'csvFiles' コレクションからIDでドキュメントを取得
  docRef.get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();

      // データ構造に応じたデータ取得
      pickingData = data.data ? data.data : data; // 必要に応じてネストされたdataを取得
      console.log("格納されたpickingData: ", pickingData);

      // ピッキングNo.でソート
      const sortedData = Object.keys(pickingData).sort((a, b) => {
        // ピッキングNo.が "不明" などのケースをスキップ
        if (!a.match(/\d+/) || !b.match(/\d+/)) {
          console.warn('ピッキングNo.が不明なデータをスキップしました:', a, b);
          return 0;
        }

        // 辞書順（数値として扱う場合に備え、可能であれば数値変換）
        const numA = parseInt(a.match(/\d+/)[0], 10); // ピッキングNo.から数字部分を抽出して数値化
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB; // 数字部分を比較して昇順にソート
      });

      // ソートされたデータを格納
      pickingData = sortedData.reduce((acc, key) => {
        acc[key] = pickingData[key];
        return acc;
      }, {});

      console.log("ソートされたpickingData: ", pickingData);
      currentIndex = 0;
      renderPickingList();
    } else {
      console.error("指定されたピッキングリストが存在しません。");
    }
  }).catch((error) => {
    console.error("データ取得に失敗しました: ", error);
  });
}

// ページが読み込まれたときにピッキングリストをロード
window.onload = function() {
  loadPickingList();
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

  // 不明なデータやitemsが存在しない場合の処理
  if (!pickingInfo || !pickingInfo.items || !Array.isArray(pickingInfo.items)) {
    console.error(`ピッキングデータにアイテムが存在しません - ピッキングNO: ${pickingNo}`);
    return;
  }

  const pickingDiv = document.createElement('div');
  pickingDiv.className = 'list';

  // ピッキング全体の情報表示（チェックフラグなど）
  const pickingHeader = `
    <div class="list-header">
      <div>
        <h2>ピッキングNO: <span class="highlight">${pickingNo}</span></h2>
        <p>購入者: ${pickingInfo.customerName}</p>
        <p>検品完了: ${pickingInfo.checked ? '完了' : '未完了'}</p>
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
    // 検品完了フラグをFirebaseに保存する
    const pickingListId = getPickingListIdFromURL(); // URLからIDを取得
    const docRef = db.collection('csvFiles').doc(pickingListId); // Firestore内の該当ドキュメントを参照

    docRef.update({
      [`data.${pickingNo}.checked`]: true // ピッキングNo単位でcheckedフラグをtrueに更新
    })
    .then(() => {
      console.log('検品完了フラグが更新されました');
    })
    .catch((error) => {
      console.error('検品完了フラグの更新に失敗しました:', error);
    });

    // 次のピッキングNoに移行する処理
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
