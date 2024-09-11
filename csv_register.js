// CSVをFirestoreにアップロードする関数
function uploadCSV() {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    alert("ファイルを選択してください");
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function(event) {
    const csvData = event.target.result;
    // CSVデータをヘッダーありでパースする
    const parsedData = Papa.parse(csvData, { header: true }).data;

    // パースされたCSVデータを確認
    console.log("パースされたデータ: ", parsedData);

    // データをピッキング番号ごとにグループ化する
    const groupedData = groupByPickingNo(parsedData);

    console.log("グループ化されたデータ: ", groupedData);

    // Firestoreに保存する処理
    const csvId = new Date().getTime().toString();
    db.collection('csvFiles').doc(csvId).set({
      data: groupedData
    }).then(() => {
      alert('CSVデータがFirestoreに保存されました！');
      loadCSVList();
    }).catch((error) => {
      console.error('Error writing document: ', error);
    });
  };

  reader.readAsText(file);
}

// ピッキング番号ごとにデータをグループ化する関数
function groupByPickingNo(data) {
  return data.reduce((acc, row) => {
    // CSVの各列に対応するヘッダー名を使用してデータを取得
    const pickingNo = row['ピッキングNO'] || "不明"; // ピッキングNO
    const customerName = row['出荷先名'] || "不明"; // 出荷先名
    const productName = row['商品名'] || "不明"; // 商品名
    const quantity = row['出荷引当数'] || "0"; // 出荷引当数
    const barcode = row['バーコード'] || "不明"; // バーコード

    // 各データのログを出力して確認
    console.log({ pickingNo, customerName, productName, quantity, barcode });

    // ピッキング番号がまだグループ化されていない場合、新しいグループを作成
    if (!acc[pickingNo]) {
      acc[pickingNo] = {
        customerName: customerName,
        items: []
      };
    }

    // 商品情報をグループに追加
    acc[pickingNo].items.push({
      productName: productName,
      quantity: quantity,
      barcode: barcode
    });

    return acc;
  }, {});
}

// CSVリストをロードする関数
function loadCSVList() {
  const ul = document.getElementById('csvList'); // CSVリストを表示する<ul>要素を取得
  ul.innerHTML = ''; // 既存のリストをクリア

  db.collection('csvFiles').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const li = document.createElement('li'); // 新しい<li>要素を作成
      li.textContent = `ID: ${doc.id} - Data: ${JSON.stringify(doc.data().data)}`; // <li>の内容を設定
      ul.appendChild(li); // <ul>に<li>を追加
    });
  }).catch((error) => {
    console.error('Error getting documents: ', error);
  });
}

// リストにアイテムを追加する関数
function addItemToList(item) {
  const ul = document.getElementById('csvList'); // <ul>要素を取得
  const li = document.createElement('li'); // 新しい<li>を作成
  li.textContent = item; // <li>に内容を追加
  ul.appendChild(li); // <ul>に<li>を追加
}
