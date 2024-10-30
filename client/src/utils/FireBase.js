// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_authDomain,
  projectId: import.meta.env.VITE_FIREBASE_projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_appId,
  measurementId: import.meta.env.VITE_FIREBASE_measurementId,
};

// Initialize Firebase
export const appFirebase = initializeApp(firebaseConfig);

export const uploadFile = ({ path, fileName, file }) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage();
    const storageRef = ref(storage, `${path}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Handle upload progress
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error("Upload error:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};
