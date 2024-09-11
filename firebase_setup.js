// Firebase設定とFirestoreインスタンス作成
if (!window.db) { // すでにdbが定義されているか確認
  const firebaseConfig = {
    apiKey: "AIzaSyDNLyIJYdnKFPZxouhcUZPQf_UwN0afSY4",
    authDomain: "barcode-inspection.firebaseapp.com",
    projectId: "barcode-inspection",
    storageBucket: "barcode-inspection.appspot.com",
    messagingSenderId: "451122231472",
    appId: "1:451122231472:web:fb7ded68d1b25c33166375"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Firestoreインスタンスを作成してグローバルに保存
  window.db = firebase.firestore();
}
