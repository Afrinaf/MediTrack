import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';



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


export { db };
