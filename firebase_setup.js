// Firebaseの初期化コード（重複定義の回避）
if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyDNLyIJYdnKFPZxouhcUZPQf_UwN0afSY4",
    authDomain: "barcode-inspection.firebaseapp.com",
    projectId: "barcode-inspection",
    storageBucket: "barcode-inspection.appspot.com",
    messagingSenderId: "451122231472",
    appId: "1:451122231472:web:fb7ded68d1b25c33166375"
  };

  // Firebase初期化
  firebase.initializeApp(firebaseConfig);

  // Firestoreインスタンスを作成
  const db = firebase.firestore();
}

// Firestoreインスタンスが既に作成されていれば、それを再利用
const db = firebase.firestore();
