import { EventEmitter } from "events";
import { generateToken } from "./Token/GenerateToken.utils.js";
import { sendEmail } from "./sendEmail.utils.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("sendEmail", async (data) => {
  const { email } = data;

  // Send email
  const token = await generateToken({
    payload: { email },
    SIGNATURE: process.env.JWT_SIGNATURE_EMAIL,
    options: { expiresIn: "1h" },
  });
  const link = `http://localhost:3000/users/confirmEmail/${token}`;

  const isSend = await sendEmail({
    to: email,
    subject: "Hello ✔",
    html: `<a href="${link}">Confirm Email</a>`,
  });

  if (!isSend) {
    throw new Error("Fail to send email", { cause: 404 });
  }
});
eventEmitter.on("forgetPassword", async (data) => {
  const { email ,otp} = data;

  const isSend = await sendEmail({
    to: email,
    subject: `"Forget password-check the body for OTP"`,
    html: `<h1>Your otp is ${otp} </h1>`,
  });

  if (!isSend) {
    throw new Error("Fail to send email", { cause: 404 });
  }
});
