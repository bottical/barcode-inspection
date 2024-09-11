// 検品ページでIDからFirestoreのデータを取得して表示する
function loadPickingData() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id'); // クエリパラメータからIDを取得

  if (id) {
    db.collection('csvFiles').doc(id).get().then((doc) => {
      if (doc.exists) {
        const data = doc.data().data;
        console.log("検品データ: ", data);
        // ここで検品データを画面に表示する処理を行う
        renderPickingList(data); // 例: 検品リストを表示する関数
      } else {
        console.log("データが見つかりませんでした");
      }
    }).catch((error) => {
      console.error('Error getting document:', error);
    });
  } else {
    console.log("IDが指定されていません");
  }
}

// 検品データを表示する関数（例）
function renderPickingList(data) {
  const container = document.getElementById('pickingListContainer'); // 検品リストを表示するコンテナ要素
  container.innerHTML = ''; // 既存の内容をクリア

  // 各ピッキングデータを表示
  for (const [pickingNo, details] of Object.entries(data)) {
    const section = document.createElement('section');
    section.innerHTML = `
      <h3>ピッキング番号: ${pickingNo}</h3>
      <p>顧客名: ${details.customerName}</p>
      <ul>
        ${details.items.map(item => `
          <li>商品: ${item.productName}, 数量: ${item.quantity}, バーコード: ${item.barcode}</li>
        `).join('')}
      </ul>
    `;
    container.appendChild(section);
  }
}
