// Firebaseの初期化コード
const firebaseConfig = {
  apiKey: "AIzaSyDNLyIJYdnKFPZxouhcUZPQf_UwN0afSY4",
  authDomain: "barcode-inspection.firebaseapp.com",
  projectId: "barcode-inspection",
  storageBucket: "barcode-inspection.appspot.com",
  messagingSenderId: "451122231472",
  appId: "1:451122231472:web:fb7ded68d1b25c33166375"
};
// Firebaseが初期化されていない場合のみ初期化
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firestoreインスタンスを作成
const db = firebase.firestore();
