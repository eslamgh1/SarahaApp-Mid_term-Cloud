// Require the cloudinary library
import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret:process.env.API_SECRET
});


export default cloudinary;