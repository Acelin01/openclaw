import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateHashedPassword(password: string) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export function generateDummyPassword() {
  const password = crypto.randomUUID();
  const hashedPassword = generateHashedPassword(password);
  return hashedPassword;
}
