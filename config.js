import  firebase from "firebase" 
const firebaseConfig = {
    apiKey: "AIzaSyDHmAW4zP52GK4qf7SSHvTa-CS5jwtmzdY",
    authDomain: "wily-960a6.firebaseapp.com",
    projectId: "wily-960a6",
    storageBucket: "wily-960a6.appspot.com",
    messagingSenderId: "365935261713",
    appId: "1:365935261713:web:eb465d087d5fb3cf7c99b0"
  };
  if(!firebase.apps.length){ firebase.initializeApp(firebaseConfig); } 
  export default firebase.database()