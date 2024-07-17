import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage,uploadBytes, getDownloadURL } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyBUj2mbmLXiIpii7KIQDvWbSnDNFg2JjWU",
    authDomain: "eprescription-7a141.firebaseapp.com",
    projectId: "eprescription-7a141",
    storageBucket: "eprescription-7a141.appspot.com",
    messagingSenderId: "116865623448",
    appId: "1:116865623448:web:6cb5e93a2b8828af5ab7ed",
    measurementId: "G-3GWZM19068"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

//  reference to the database service
const db = getDatabase(firebaseApp);
const stg = getStorage(firebaseApp);
console.log(stg)

export { db, stg };