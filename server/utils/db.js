import mongoose from "mongoose";

const connectDB = async () => {
  const URL = process.env.DB_URL;
  mongoose
    .connect(URL)
    .then(() => {
      console.log("DB connected");
    })
    .catch((err) => {
      console.log(err);
      console.log("DB not connected");
    });
};


export default connectDB;