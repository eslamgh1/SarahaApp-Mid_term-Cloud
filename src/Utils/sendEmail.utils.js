import nodemailer from "nodemailer";

export const sendEmail = async ({to, subject, html, attachments}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "eslam.we1986@gmail.com",
      pass: "erxcjzlkludutsuo",
    },
  });

  const info = await transporter.sendMail({
    from: "eslam.we1986@gmail.com",
    to,
    subject: subject || "Hello ✔",
    html: html || "<b>Hello world?</b>", // HTML body
    attachments: attachments || [],
  });

  if (info.accepted.length > 0) {
    return true;
  } else {
    return false;
  }
};
