// Firebaseの初期化コード（重複定義の回避）
if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Firebase初期化
  firebase.initializeApp(firebaseConfig);

  // Firestoreインスタンスを作成
  const db = firebase.firestore();
}

// Firestoreインスタンスが既に作成されていれば、それを再利用
const db = firebase.firestore();
