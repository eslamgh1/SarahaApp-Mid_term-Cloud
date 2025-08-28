import mongoose from 'mongoose';
import chalk from 'chalk';

const connectDB = async()=>{
  await mongoose.connect(process.env.DB_URL_ONLINE)
  .then(()=>{
  console.log(chalk.blue("DB is connected successfully"))
  })
  .catch((error=>{
console.log("Faild to connect DB")
  }))
}


export default connectDB;