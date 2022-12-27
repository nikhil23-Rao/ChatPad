import CryptoJS from 'crypto-js';
const CHATPAD_SECURE_KEY = 'ShFSES21qHsQEqZXMxQ9zgHy+bu0=';
export function encrypt(text = '', key = CHATPAD_SECURE_KEY) {
  const message = CryptoJS.AES.encrypt(text, key);
  return message.toString();
}
export function decrypt(message = '', key = CHATPAD_SECURE_KEY) {
  var code = CryptoJS.AES.decrypt(message, key);
  var decryptedMessage = code.toString(CryptoJS.enc.Utf8);

  return decryptedMessage;
}
