
import { customAlphabet } from 'nanoid';

export const generateDummyPassword = () => {
  const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    16
  );
  return nanoid();
};
