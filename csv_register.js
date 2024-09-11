function uploadCSV() {
  const fileInput = document.getElementById('fileInput');
  
  if (!fileInput) {
    console.error("ファイル入力要素が見つかりません。");
    alert("ファイル入力要素が見つかりません。");
    return;
  }

  const file = fileInput.files[0];

  if (!file) {
    alert("CSVファイルを選択してください。");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {
    const csvData = event.target.result;
    const parsedData = Papa.parse(csvData, { header: true }).data;

    // パースされたCSVデータを確認
    console.log("パースされたデータ: ", parsedData);

    // ピッキング番号ごとにデータをグループ化
    const groupedData = groupByPickingNo(parsedData);

    // グループ化されたデータを確認
    console.log("グループ化されたデータ: ", groupedData);

    const csvId = Date.now().toString(); // 一意のIDを生成

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
    const pickingNo = item.pickingNo || "不明"; // `pickingNo`がない場合は"不明"を使用
    const customerName = item.customerName || "不明"; // `customerName`がない場合は"不明"を使用
    const productName = item.productName || "不明";
    const quantity = item.quantity || "0";
    const barcode = item.barcode || "不明";

    // フィールドのデフォルト値を確認
    console.log({ pickingNo, customerName, productName, quantity, barcode });

    if (!acc[pickingNo]) {
      acc[pickingNo] = {
        customerName: customerName,
        items: []
      };
    }

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
