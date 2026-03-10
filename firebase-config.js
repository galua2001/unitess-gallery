// ============================================================
//  Firebase 설정 파일 - unitess-gallery 프로젝트
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBQgFXmYOUmYiOWW5wWNb29l2QV_MuS1DY",
    authDomain: "unitess-gallery.firebaseapp.com",
    projectId: "unitess-gallery",
    storageBucket: "unitess-gallery.firebasestorage.app",
    messagingSenderId: "632832672662",
    appId: "1:632832672662:web:79f02fb3ba6890d9d553b7"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// 전역에서 사용할 db, storage 객체
window.db = firebase.firestore();
window.storage = firebase.storage();

console.log("🔥 Firebase 연결 완료:", firebaseConfig.projectId);
