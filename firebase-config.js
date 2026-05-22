import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpsbLQrVis2c-u7XwK_tTfxpdBknhAR6w",
  authDomain: "attendance-tracker-e226b.firebaseapp.com",
  projectId: "attendance-tracker-e226b",
  storageBucket: "attendance-tracker-e226b.firebasestorage.app",
  messagingSenderId: "135975292431",
  appId: "1:135975292431:web:04571d1131c76788f15d7a"
};

const attendance_firebase_app = initializeApp(firebaseConfig);
const auth_service_instance = getAuth(attendance_firebase_app);
const google_auth_provider = new GoogleAuthProvider();
const firestore_database_instance = getFirestore(attendance_firebase_app);


export { auth_service_instance, google_auth_provider, firestore_database_instance };