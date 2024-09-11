// CSVファイルをFirestoreにアップロードする機能
function uploadCSV() {
  const fileInput = document.getElementById('csvFileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert("ファイルを選択してください。");
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = text.split('\n').slice(1).map(row => row.split(',')); // CSVデータ解析

    // Firestoreに保存
    db.collection('csvFiles').add({
      fileName: file.name,
      data: rows,
      uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      alert("CSVファイルが登録されました！");
      loadCSVList();
    }).catch(error => {
      console.error("Error writing document: ", error);
    });
  };

  reader.readAsText(file, 'UTF-8');
}

// 登録済みCSV一覧を表示
function loadCSVList() {
  const csvListElement = document.getElementById('csvList');
  csvListElement.innerHTML = '';

  db.collection('csvFiles').orderBy('uploadedAt', 'desc').get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <span>${data.fileName}</span>
        <a href="picking_list.html?csvId=${doc.id}">検品実行</a>
      `;
      csvListElement.appendChild(listItem);
    });
  });
}

// 初回ロード時にCSVリストを読み込む
window.onload = loadCSVList;
