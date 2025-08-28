import CryptoJS from "crypto-js";

export const Encrypt = async ({plainText, SECRET_KEY}) => {
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
}


// import CryptoJS from "crypto-js";

// // Synchronous Encrypt function
// export const Encrypt = (plainText, SECRET_KEY) => {
//   if (!plainText || !SECRET_KEY) {
//     throw new Error("plainText and SECRET_KEY must be provided");
//   }
//   return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
// };