import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage,uploadBytes, getDownloadURL } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

//  reference to the database service
const db = getDatabase(firebaseApp);
const stg = getStorage(firebaseApp);
console.log(stg)

export { db, stg };
