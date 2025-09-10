import CryptoJS from 'crypto-js';

// Константы для безопасности
const SALT_ROUNDS = 10;
const SECRET_KEY = 'softpack_security_key_2024'; // В продакшене должен быть в переменных окружения

// Хеширование паролей
export function hashPassword(password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128/8);
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  return salt.toString() + hash.toString();
}

// Проверка пароля
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const salt = CryptoJS.enc.Hex.parse(hashedPassword.substring(0, 32));
    const hash = hashedPassword.substring(32);
    const testHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    return hash === testHash.toString();
  } catch {
    return false;
  }
}

// Валидация email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Валидация пароля
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Пароль должен содержать минимум 8 символов' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Пароль слишком длинный' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать заглавные буквы, строчные буквы и цифры' };
  }
  return { valid: true };
}

// Валидация имени пользователя
export function validateName(name: string): { valid: boolean; message?: string } {
  if (name.length < 2) {
    return { valid: false, message: 'Имя должно содержать минимум 2 символа' };
  }
  if (name.length > 50) {
    return { valid: false, message: 'Имя слишком длинное' };
  }
  if (!/^[a-zA-Zа-яА-Я0-9\s\-_]+$/.test(name)) {
    return { valid: false, message: 'Имя содержит недопустимые символы' };
  }
  return { valid: true };
}

// Санитизация HTML (защита от XSS)
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Валидация URL
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// Валидация YouTube URL
export function validateYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/
  ];
  return patterns.some(pattern => pattern.test(url));
}

// Rate limiting (простая реализация)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// Генерация CSRF токена
export function generateCSRFToken(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

// Проверка CSRF токена
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

// Логирование безопасности
export function logSecurityEvent(event: string, details: any = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // В продакшене это должно отправляться на сервер
  console.warn('Security Event:', logEntry);
  
  // Сохраняем в localStorage для отладки (в продакшене убрать)
  try {
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    // Ограничиваем количество логов
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    localStorage.setItem('security_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log security event:', e);
  }
}
