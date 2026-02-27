import crypto from "crypto";

/**
 * 生成安全的随机令牌
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * 验证邮箱地址格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号码格式（中国大陆）
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证身份证号码格式（中国大陆）
 */
export function validateIdCard(idCard: string): boolean {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardRegex.test(idCard);
}

/**
 * 生成随机验证码
 */
export function generateVerificationCode(length: number = 6): string {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

/**
 * 生成随机密码
 */
export function generateRandomPassword(length: number = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = lowercase + uppercase + numbers + symbols;
  let password = "";

  // 确保包含至少每种类型的字符
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // 填充剩余长度
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 打乱字符顺序
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * 哈希敏感数据
 */
export function hashSensitiveData(data: string, salt?: string): string {
  const saltValue = salt || crypto.randomBytes(16).toString("hex");
  return crypto.pbkdf2Sync(data, saltValue, 10000, 64, "sha512").toString("hex");
}

/**
 * 验证数据哈希
 */
export function verifyDataHash(data: string, hash: string, salt: string): boolean {
  const computedHash = crypto.pbkdf2Sync(data, salt, 10000, 64, "sha512").toString("hex");
  return computedHash === hash;
}

/**
 * 加密敏感数据
 */
export function encryptSensitiveData(data: string, key: string): string {
  const algorithm = "aes-256-cbc";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * 解密敏感数据
 */
export function decryptSensitiveData(encryptedData: string, key: string): string {
  const algorithm = "aes-256-cbc";
  const parts = encryptedData.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * 生成安全的文件上传路径
 */
export function generateSecureFilePath(userId: string, originalName: string): string {
  const timestamp = Date.now();
  const randomString = generateSecureToken(8);
  const extension = originalName.split(".").pop();
  return `uploads/${userId}/${timestamp}_${randomString}.${extension}`;
}

/**
 * 验证文件类型
 */
export function validateFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * 验证文件大小
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * 清理用户输入
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // 移除HTML标签
    .replace(/javascript:/gi, "") // 移除javascript协议
    .replace(/on\w+\s*=/gi, "") // 移除事件处理器
    .trim();
}

/**
 * 验证URL安全性
 */
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ["http:", "https:"];
    return allowedProtocols.includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * 生成请求签名
 */
export function generateRequestSignature(
  method: string,
  url: string,
  timestamp: number,
  secret: string,
): string {
  const data = `${method}:${url}:${timestamp}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * 验证请求签名
 */
export function verifyRequestSignature(
  signature: string,
  method: string,
  url: string,
  timestamp: number,
  secret: string,
): boolean {
  const expectedSignature = generateRequestSignature(method, url, timestamp, secret);
  return signature === expectedSignature;
}
