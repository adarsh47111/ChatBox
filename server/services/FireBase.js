// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { deleteObject, getStorage, ref } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: process.env.FIREBASE_authDomain,
  projectId: process.env.FIREBASE_projectId,
  storageBucket: process.env.FIREBASE_storageBucket,
  messagingSenderId: process.env.FIREBASE_messagingSenderId,
  appId: process.env.FIREBASE_appId,
  measurementId: process.env.FIREBASE_measurementId,
};

// Initialize Firebase
export const appFirebase = initializeApp(firebaseConfig);

export const deleteFile = async ({ fileName }) => {
  return new Promise((resolve, reject) => {
    // Assume firebase is imported and initialized
    var storage = getStorage();

    // Create a reference to the file to delete
    const fileRef = ref(storage, `messages/${fileName}`);

    // Delete the file
    deleteObject(fileRef)
      .then(() => {
        // File deleted successfully
        resolve();
      })
      .catch((error) => {
        // Uh-oh, an error occurred!
        reject();
      });
  });
};
