// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { deleteObject, getStorage, ref } from "firebase/storage";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_authDomain,
  projectId: FIREBASE_projectId,
  storageBucket: FIREBASE_storageBucket,
  messagingSenderId: FIREBASE_messagingSenderId,
  appId: FIREBASE_appId,
  measurementId: FIREBASE_measurementId,
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
