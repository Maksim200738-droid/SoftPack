import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { hashPassword, verifyPassword, validateEmail, validatePassword, validateName, logSecurityEvent, checkRateLimit } from './security';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = 'softpack_users_v1';
const CURRENT_KEY = 'softpack_current_user_v1';

function readUsers(): Array<{ id: string; name: string; email: string; password: string; role: 'user' | 'admin' }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    // Добавляем роль по умолчанию для существующих пользователей
    return users.map((user: any) => ({ ...user, role: user.role || 'user' }));
  } catch {
    return [];
  }
}

function writeUsers(list: Array<{ id: string; name: string; email: string; password: string; role: 'user' | 'admin' }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function readCurrent(): AuthUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCurrent(user: AuthUser | null) {
  if (user) localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(readCurrent());
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Валидация входных данных
    if (!validateEmail(email)) {
      logSecurityEvent('invalid_email_attempt', { email });
      throw new Error('Некорректный email');
    }

    // Rate limiting
    if (!checkRateLimit(`login_${email}`, 5, 300000)) { // 5 попыток за 5 минут
      logSecurityEvent('rate_limit_exceeded', { email, action: 'login' });
      throw new Error('Слишком много попыток входа. Попробуйте позже.');
    }

    const users = readUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!found) {
      logSecurityEvent('login_failed_user_not_found', { email });
      throw new Error('Неверный email или пароль');
    }

    // Проверка пароля с хешированием
    if (!verifyPassword(password, found.password)) {
      logSecurityEvent('login_failed_wrong_password', { email, userId: found.id });
      throw new Error('Неверный email или пароль');
    }

    const safe: AuthUser = { id: found.id, email: found.email, name: found.name, role: found.role };
    writeCurrent(safe);
    setUser(safe);
    
    logSecurityEvent('login_success', { userId: found.id, email: found.email, role: found.role });
  };

  const register = async (name: string, email: string, password: string) => {
    // Валидация входных данных
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      logSecurityEvent('invalid_name_attempt', { name, email });
      throw new Error(nameValidation.message);
    }

    if (!validateEmail(email)) {
      logSecurityEvent('invalid_email_attempt', { email });
      throw new Error('Некорректный email');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      logSecurityEvent('weak_password_attempt', { email });
      throw new Error(passwordValidation.message);
    }

    // Rate limiting для регистрации
    if (!checkRateLimit(`register_${email}`, 3, 600000)) { // 3 попытки за 10 минут
      logSecurityEvent('rate_limit_exceeded', { email, action: 'register' });
      throw new Error('Слишком много попыток регистрации. Попробуйте позже.');
    }

    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      logSecurityEvent('register_failed_email_exists', { email });
      throw new Error('Пользователь с таким email уже существует');
    }

    // Специальный админ-аккаунт
    const role = (name.toLowerCase() === 'gademoff' && email.toLowerCase() === 'gademoff@admin.com') ? 'admin' as const : 'user' as const;
    
    // Хешируем пароль
    const hashedPassword = hashPassword(password);
    const newUser = { id: String(Date.now()), name, email, password: hashedPassword, role };
    users.push(newUser);
    writeUsers(users);
    
    const safe: AuthUser = { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
    writeCurrent(safe);
    setUser(safe);
    
    logSecurityEvent('register_success', { userId: newUser.id, email: newUser.email, role: newUser.role });
  };

  const logout = () => {
    if (user) {
      logSecurityEvent('logout', { userId: user.id, email: user.email });
    }
    writeCurrent(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({ user, isLoading, login, register, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
