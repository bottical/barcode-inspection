// CSVファイルを読み込み、Firestoreに保存する関数
function uploadCSV() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const csvData = event.target.result;
    const parsedData = Papa.parse(csvData, { header: true }).data;

    // ピッキング番号ごとにデータをグループ化する関数
    const groupedData = groupByPickingNo(parsedData);

    // Firestoreにデータを保存
    const csvId = Date.now().toString(); // 一意のIDを生成（ここでは現在時刻を利用）
    db.collection('csvFiles').doc(csvId).set({
      data: groupedData
    }).then(() => {
      alert('CSVデータがFirestoreに保存されました！');
      loadCSVList(); // CSVリストを更新
    }).catch((error) => {
      console.error('Error writing document: ', error);
    });
  };

  reader.readAsText(file);
}

// ピッキング番号ごとにデータをグループ化する関数
function groupByPickingNo(data) {
  return data.reduce((acc, item) => {
    const { pickingNo, customerName, productName, quantity, barcode } = item;

    // まだこのピッキング番号がない場合は新しいエントリを作成
    if (!acc[pickingNo]) {
      acc[pickingNo] = {
        customerName: customerName,
        items: []
      };
    }

    // 商品データを追加
    acc[pickingNo].items.push({
      productName: productName,
      quantity: quantity,
      barcode: barcode
    });

    return acc;
  }, {});
}

// Firestoreから保存されたCSVリストをロードする関数
function loadCSVList() {
  const csvListElement = document.getElementById('csvList');
  csvListElement.innerHTML = ''; // 前のリストをクリア

  db.collection('csvFiles').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const csvId = doc.id;
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <a href="picking_list.html?csvId=${csvId}">CSV ${csvId}を検品</a>
      `;
      csvListElement.appendChild(listItem);
    });
  });
}

// ページロード時にFirestoreからCSVリストを読み込む
window.onload = loadCSVList;
