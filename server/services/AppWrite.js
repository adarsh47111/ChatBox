// import { Client, ID, Storage } from "appwrite";
// import { Blob } from "buffer";
// import { Readable } from "stream";

// export const upload = async ({ fileName, file }) => {
//   const client = new Client()
//     .setEndpoint("https://cloud.appwrite.io/v1")
//     .setProject("662262f01842f5e4921a");

//   const storage = new Storage(client);

//   // Convert the file buffer to a Readable Stream
//   const stream = new Readable();
//   stream.push(file);
//     stream.push(null);
    
//       const blob = new Blob([file]);


//   const promise = new Promise((resolve, reject) => {
//     // Create a file using the stream
//     storage
//       .createFile("662263d7c816eb0c3f1d", fileName, Blob)
//       .then((response) => {
//         resolve(response);
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });

//   // Wait for the upload to complete
//   try {
//     const response = await promise;
//     console.log("File uploaded successfully:", response);
//   } catch (error) {
//     console.error("Error uploading file:", error);
//   }
// };
