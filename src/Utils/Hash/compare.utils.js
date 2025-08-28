import bcrypt from "bcrypt";

export const Comare = async ({
  palinText,
  cipherText
}) => {
  return bcrypt.compareSync(palinText, cipherText);
};
