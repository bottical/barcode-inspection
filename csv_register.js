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

    // ピッキングNoの総数と完了数をカウント
    const totalPickingNo = Object.keys(groupedData).length;
    let completedPickingNo = 0;
    Object.values(groupedData).forEach(group => {
      if (group.checked) {
        completedPickingNo++;
      }
    });
    
    // Firestoreに保存する処理
    const csvId = new Date().getTime().toString();
    db.collection('csvFiles').doc(csvId).set({
      data: groupedData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(), // 登録日時
      totalPickingNo: totalPickingNo, // ピッキングNoの総数
      completedPickingNo: completedPickingNo // 完了済みのピッキングNo数（初期は0）
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
    const pickingNo = row['ピッキングNO'] || null; // ピッキングNO
    const customerName = row['出荷先名'] || null; // 出荷先名
    const productName = row['商品名'] || null; // 商品名
    const quantity = row['出荷引当数'] || null; // 出荷引当数
    const barcode = row['バーコード'] || null; // バーコード
    // 現在の日時を取得してcreatedAtフィールドとして保存
    const createdAt = firebase.firestore.FieldValue.serverTimestamp();

        // 不正なデータや空のピッキング番号をスキップ
    if (!pickingNo) {
      console.log("スキップされたデータ:", row);
      return acc;
    }
    
   // ピッキング番号がまだグループ化されていない場合、新しいグループを作成
    if (!acc[pickingNo]) {
      acc[pickingNo] = {
        customerName: customerName || "不明", // customerName は任意のため、不明
        items: [],
        checked: false, // ピッキング番号単位での完了フラグ、最初はfalse
        createdAt: createdAt // 作成日時を追加
      };
    }

    // 商品情報をグループに追加
    acc[pickingNo].items.push({
      productName: productName,
      quantity: quantity || "0", // 数量は0をデフォルトにする
      barcode: barcode
    });

    return acc;
  }, {});
}

// CSVリストをロードしてリンクと共に日付や検品数を表示する関数
function loadCSVListWithDetails() {
  const ul = document.getElementById('csvList'); // CSVリストを表示する<ul>要素を取得
  ul.innerHTML = ''; // 既存のリストをクリア

  db.collection('csvFiles').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt ? formatDate(data.createdAt.toDate()) : "日時不明"; // フォーマット適用
      const totalPickingNo = data.totalPickingNo || 0;
      const completedPickingNo = data.completedPickingNo || 0;

      // 新しい<li>要素を作成
      const li = document.createElement('li');
      
      // リンク要素を作成
      const link = document.createElement('a');
      link.textContent = `検品実行: ${doc.id}`; // リンクテキストを設定
      link.href = `picking_list.html?id=${doc.id}`; // 検品ページへのリンクを設定
      link.target = '_blank'; // 新しいタブで開くように設定

      // 日付と検品数を含めた内容
      const info = document.createElement('span');
      info.textContent = ` - 登録日時: ${createdAt} - ピッキングNo: ${completedPickingNo} / ${totalPickingNo}`;

      // <li>にリンクと情報を追加
      li.appendChild(link);
      li.appendChild(info);
      
      // <ul>に<li>を追加
      ul.appendChild(li);
    });
  }).catch((error) => {
    console.error('Error getting documents: ', error);
  });
}

// ページ読み込み時に呼び出す
window.onload = function() {
  loadCSVListWithDetails(); // リンク付きのCSVリストを日付や検品数と共に表示
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月は0から始まるので+1
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0'); // 2桁で表示
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}
