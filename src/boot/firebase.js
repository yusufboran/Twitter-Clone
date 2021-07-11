import firebase from "firebase/app"
import "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBe0Kk4EECXiiqAVMvNRrTcgb-o0n_XZus",
  authDomain: "qwitter-9d5c9.firebaseapp.com",
  databaseURL: "https://qwitter-9d5c9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "qwitter-9d5c9",
  storageBucket: "qwitter-9d5c9.appspot.com",
  messagingSenderId: "209932649540",
  appId: "1:209932649540:web:ed53900ba3b34bca4e2811"
}


firebase.initializeApp(firebaseConfig)

let db = firebase.firestore()

export default db