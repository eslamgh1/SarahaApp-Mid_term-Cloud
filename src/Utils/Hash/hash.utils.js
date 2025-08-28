import bcrypt from "bcrypt";

export const Hash = async ({
  palinText,
  SALT_ROUNDS = process.env.SALT_ROUNDS,
}) => {
  return bcrypt.hashSync(palinText, Number(SALT_ROUNDS));
};
