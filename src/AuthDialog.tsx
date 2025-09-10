import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tabs, Tab, Alert, Stack } from '@mui/material';
import { useAuth } from './authContext.tsx';

export default function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email.trim(), password);
      } else {
        if (!name.trim()) throw new Error('Введите имя');
        await register(name.trim(), email.trim(), password);
      }
      reset();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{tab === 'login' ? 'Вход' : 'Регистрация'}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="auth tabs">
          <Tab value="login" label="Войти" />
          <Tab value="register" label="Регистрация" />
        </Tabs>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {tab === 'register' && (
            <TextField label="Имя" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
          )}
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {tab === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
