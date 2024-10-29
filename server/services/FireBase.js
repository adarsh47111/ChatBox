// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUEoJYTqpWsTkcXXT3KFzd-x5yxQZH59E",
  authDomain: "chat-app-690d2.firebaseapp.com",
  projectId: "chat-app-690d2",
  storageBucket: "chat-app-690d2.appspot.com",
  messagingSenderId: "422240242400",
  appId: "1:422240242400:web:495931c7277117916ede85",
  measurementId: "G-TBHWH0BR43",
};

// Initialize Firebase
export const appFirebase = initializeApp(firebaseConfig);
// const analytics = getAnalytics(appFirebase);

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
