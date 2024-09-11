// Firebaseの初期化コード
// Firebaseコンソールで取得した設定を使用してfirebaseを初期化します
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
const db = firebase.firestore();
