import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  BarChart as BarChartIcon,
  Games as GamesIcon,
  Security as SecurityIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useAuth } from './authContext';
import { useData, Game, Cheat } from './dataContext';
import { sanitizeHtml, validateUrl, validateYouTubeUrl, logSecurityEvent } from './security';


function AdminPanel() {
  const { user } = useAuth();
  const { games, cheats, settings, updateSettings, setGames, setCheats, addGame, addCheat, updateGame, updateCheat, deleteGame, deleteCheat } = useData();
  const [activeTab, setActiveTab] = useState<'analytics' | 'games' | 'cheats'>('analytics');
  const [gameDialog, setGameDialog] = useState(false);
  const [cheatDialog, setCheatDialog] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingCheat, setEditingCheat] = useState<Cheat | null>(null);
  const [gameForm, setGameForm] = useState({ name: '', description: '', image: '' });
  const [cheatForm, setCheatForm] = useState({ gameId: '', name: '', description: '', url: '', image: '', tags: [] as string[] });
  const [gameImageFile, setGameImageFile] = useState<File | null>(null);
  const [cheatImageFile, setCheatImageFile] = useState<File | null>(null);
  const [cheatFilters, setCheatFilters] = useState<{ gameId: string; tags: string[]; query: string }>({ gameId: '', tags: [], query: '' });

  // Хелпер: читаем файл как data URL, чтобы сохранять в localStorage (персистентно)
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  // Проверка прав администратора
  if (!user || user.role !== 'admin') {
    logSecurityEvent('unauthorized_admin_access', { 
      userId: user?.id, 
      userRole: user?.role,
      attemptedAccess: 'admin_panel'
    });
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">Доступ запрещён. Требуются права администратора.</Alert>
      </Container>
    );
  }

  const handleAddGame = () => {
    // Валидация и санитизация данных
    const sanitizedName = sanitizeHtml(gameForm.name.trim());
    const sanitizedDescription = sanitizeHtml(gameForm.description.trim());
    
    if (!sanitizedName || sanitizedName.length < 2) {
      alert('Название игры должно содержать минимум 2 символа');
      return;
    }
    
    if (sanitizedName.length > 100) {
      alert('Название игры слишком длинное');
      return;
    }

    const imageUrl = gameForm.image; // уже data URL или внешний URL

    if (editingGame) {
      logSecurityEvent('admin_game_update', { 
        adminId: user.id, 
        gameId: editingGame.id, 
        gameName: sanitizedName 
      });
      updateGame(editingGame.id, {
        name: sanitizedName,
        description: sanitizedDescription,
        image: imageUrl
      });
    } else {
      logSecurityEvent('admin_game_create', { 
        adminId: user.id, 
        gameName: sanitizedName 
      });
      addGame({
        name: sanitizedName,
        description: sanitizedDescription,
        image: imageUrl
      });
    }
    
    setGameDialog(false);
    setEditingGame(null);
    setGameForm({ name: '', description: '', image: '' });
    setGameImageFile(null);
  };

  const handleAddCheat = () => {
    // Валидация и санитизация данных
    const sanitizedName = sanitizeHtml(cheatForm.name.trim());
    const sanitizedDescription = sanitizeHtml(cheatForm.description.trim());
    const sanitizedUrl = cheatForm.url.trim();
    
    if (!sanitizedName || sanitizedName.length < 2) {
      alert('Название чита должно содержать минимум 2 символа');
      return;
    }
    
    if (sanitizedName.length > 100) {
      alert('Название чита слишком длинное');
      return;
    }

    if (sanitizedUrl && !validateUrl(sanitizedUrl)) {
      alert('Некорректный URL');
      return;
    }

    // Валидация тегов
    const sanitizedTags = cheatForm.tags.map(tag => sanitizeHtml(tag.trim())).filter(tag => tag.length > 0);
    if (sanitizedTags.length > 10) {
      alert('Слишком много тегов (максимум 10)');
      return;
    }

    const imageUrl = cheatForm.image; // уже data URL или внешний URL

    if (editingCheat) {
      logSecurityEvent('admin_cheat_update', { 
        adminId: user.id, 
        cheatId: editingCheat.id, 
        cheatName: sanitizedName,
        gameId: cheatForm.gameId
      });
      updateCheat(editingCheat.id, {
        gameId: cheatForm.gameId,
        name: sanitizedName,
        description: sanitizedDescription,
        url: sanitizedUrl,
        image: imageUrl,
        tags: sanitizedTags
      });
    } else {
      logSecurityEvent('admin_cheat_create', { 
        adminId: user.id, 
        cheatName: sanitizedName,
        gameId: cheatForm.gameId
      });
      addCheat({
        gameId: cheatForm.gameId,
        name: sanitizedName,
        description: sanitizedDescription,
        url: sanitizedUrl,
        image: imageUrl,
        tags: sanitizedTags
      });
    }
    
    setCheatDialog(false);
    setEditingCheat(null);
    setCheatForm({ gameId: '', name: '', description: '', url: '', image: '', tags: [] });
    setCheatImageFile(null);
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setGameForm({ name: game.name, description: game.description, image: game.image });
    setGameDialog(true);
  };

  const handleEditCheat = (cheat: Cheat) => {
    setEditingCheat(cheat);
    setCheatForm({ gameId: cheat.gameId, name: cheat.name, description: cheat.description, url: cheat.url, image: cheat.image, tags: cheat.tags || [] });
    setCheatDialog(true);
  };

  const handleDeleteGame = (id: string) => {
    deleteGame(id);
  };

  const handleDeleteCheat = (id: string) => {
    deleteCheat(id);
  };

  const totalDownloads = cheats.reduce((sum, cheat) => sum + cheat.downloads, 0);
  const totalGames = games.length;
  const totalCheats = cheats.length;

  // Функция для получения скачиваний игры (сумма всех читов для этой игры)
  const getGameDownloads = (gameId: string) => {
    return cheats
      .filter(cheat => cheat.gameId === gameId)
      .reduce((sum, cheat) => sum + cheat.downloads, 0);
  };

  // Функция для получения количества читов для игры
  const getGameCheatsCount = (gameId: string) => {
    return cheats.filter(cheat => cheat.gameId === gameId).length;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ color: '#f5f5f5', fontWeight: 800, mb: 4 }}>
        Админ-панель SoftPack
      </Typography>

      {/* Навигация */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant={activeTab === 'analytics' ? 'contained' : 'outlined'}
          startIcon={<BarChartIcon />}
          onClick={() => setActiveTab('analytics')}
          sx={{ 
            bgcolor: activeTab === 'analytics' ? '#7c9cff' : 'transparent',
            color: activeTab === 'analytics' ? '#0b0d12' : '#e6e6e6',
            borderColor: '#2a2e36'
          }}
        >
          Аналитика
        </Button>
        <Button
          variant={activeTab === 'games' ? 'contained' : 'outlined'}
          startIcon={<GamesIcon />}
          onClick={() => setActiveTab('games')}
          sx={{ 
            bgcolor: activeTab === 'games' ? '#7c9cff' : 'transparent',
            color: activeTab === 'games' ? '#0b0d12' : '#e6e6e6',
            borderColor: '#2a2e36'
          }}
        >
          Игры
        </Button>
        <Button
          variant={activeTab === 'cheats' ? 'contained' : 'outlined'}
          startIcon={<SecurityIcon />}
          onClick={() => setActiveTab('cheats')}
          sx={{ 
            bgcolor: activeTab === 'cheats' ? '#7c9cff' : 'transparent',
            color: activeTab === 'cheats' ? '#0b0d12' : '#e6e6e6',
            borderColor: '#2a2e36'
          }}
        >
          Читы
        </Button>
      </Stack>

      {/* Аналитика */}
      {activeTab === 'analytics' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#eaeaea', mb: 1 }}>Всего скачиваний</Typography>
                <Typography variant="h3" sx={{ color: '#7c9cff', fontWeight: 800 }}>{totalDownloads.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#eaeaea', mb: 1 }}>Игр в каталоге</Typography>
                <Typography variant="h3" sx={{ color: '#7c9cff', fontWeight: 800 }}>{totalGames}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#eaeaea', mb: 1 }}>Читов доступно</Typography>
                <Typography variant="h3" sx={{ color: '#7c9cff', fontWeight: 800 }}>{totalCheats}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#eaeaea', mb: 1 }}>Среднее скачиваний</Typography>
                <Typography variant="h3" sx={{ color: '#7c9cff', fontWeight: 800 }}>
                  {totalCheats > 0 ? Math.round(totalDownloads / totalCheats).toLocaleString() : '0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#eaeaea', mb: 2 }}>Топ игр по скачиваниям</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#b6bdc6' }}>Игра</TableCell>
                        <TableCell sx={{ color: '#b6bdc6' }}>Читов</TableCell>
                        <TableCell sx={{ color: '#b6bdc6' }}>Скачивания</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {games
                        .map(game => ({
                          ...game,
                          totalDownloads: getGameDownloads(game.id),
                          cheatsCount: getGameCheatsCount(game.id)
                        }))
                        .sort((a, b) => b.totalDownloads - a.totalDownloads)
                        .slice(0, 10)
                        .map((game) => (
                          <TableRow key={game.id}>
                            <TableCell sx={{ color: '#eaeaea' }}>{game.name}</TableCell>
                            <TableCell sx={{ color: '#eaeaea' }}>{game.cheatsCount}</TableCell>
                            <TableCell sx={{ color: '#7c9cff' }}>{game.totalDownloads.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#eaeaea', mb: 2 }}>Топ читов по скачиваниям</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#b6bdc6' }}>Чит</TableCell>
                        <TableCell sx={{ color: '#b6bdc6' }}>Игра</TableCell>
                        <TableCell sx={{ color: '#b6bdc6' }}>Скачивания</TableCell>
                        <TableCell sx={{ color: '#b6bdc6' }}>Дата добавления</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cheats
                        .sort((a, b) => b.downloads - a.downloads)
                        .slice(0, 10)
                        .map((cheat) => (
                          <TableRow key={cheat.id}>
                            <TableCell sx={{ color: '#eaeaea' }}>{cheat.name}</TableCell>
                            <TableCell sx={{ color: '#eaeaea' }}>
                              {games.find(g => g.id === cheat.gameId)?.name || 'Неизвестно'}
                            </TableCell>
                            <TableCell sx={{ color: '#7c9cff' }}>{cheat.downloads.toLocaleString()}</TableCell>
                            <TableCell sx={{ color: '#b6bdc6' }}>{cheat.createdAt}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#eaeaea', mb: 1 }}>Настройки главной</Typography>
                <Typography variant="body2" sx={{ color: '#b6bdc6', mb: 2 }}>Ссылка на YouTube-видео (заменит скриншот на главной)</Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                  <TextField
                    label="YouTube ссылка"
                    value={settings.homepageVideoUrl || ''}
                    onChange={(e) => {
                      const url = e.target.value.trim();
                      if (url && !validateYouTubeUrl(url)) {
                        alert('Некорректная ссылка на YouTube');
                        return;
                      }
                      updateSettings({ homepageVideoUrl: url });
                    }}
                    fullWidth
                    placeholder="https://youtu.be/ID или https://www.youtube.com/watch?v=ID"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        bgcolor: 'rgba(15,17,21,0.5)', 
                        '& fieldset': { borderColor: '#2a2e36' },
                        '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                      },
                      '& .MuiInputLabel-root': { color: '#b6bdc6' },
                      '& .MuiInputBase-input': { color: '#f5f5f5' }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Управление играми */}
      {activeTab === 'games' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#eaeaea' }}>Управление играми</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setGameDialog(true)}
              sx={{ bgcolor: '#7c9cff', color: '#0b0d12' }}
            >
              Добавить игру
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#b6bdc6' }}>Изображение</TableCell>
                  <TableCell sx={{ color: '#b6bdc6' }}>Название</TableCell>
                  <TableCell sx={{ color: '#b6bdc6' }}>Описание</TableCell>
                  <TableCell sx={{ color: '#b6bdc6' }}>Читов</TableCell>
                  <TableCell sx={{ color: '#b6bdc6' }}>Скачивания</TableCell>
                  <TableCell sx={{ color: '#b6bdc6' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={game.image}
                        alt={game.name}
                        sx={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#eaeaea' }}>{game.name}</TableCell>
                    <TableCell sx={{ color: '#b6bdc6' }}>{game.description}</TableCell>
                    <TableCell sx={{ color: '#eaeaea' }}>{getGameCheatsCount(game.id)}</TableCell>
                    <TableCell sx={{ color: '#7c9cff' }}>{getGameDownloads(game.id).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditGame(game)} sx={{ color: '#7c9cff' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteGame(game.id)} sx={{ color: '#ff4d4f' }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Управление читами */}
      {activeTab === 'cheats' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ color: '#eaeaea' }}>Управление читами</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Поиск по названию"
                value={cheatFilters.query}
                onChange={(e) => setCheatFilters(prev => ({ ...prev, query: e.target.value }))}
                size="small"
                sx={{ minWidth: 220,
                  '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15,17,21,0.5)', '& fieldset': { borderColor: '#2a2e36' }, '&.Mui-focused fieldset': { borderColor: '#7c9cff' } },
                  '& .MuiInputBase-input': { color: '#f5f5f5' }
                }}
              />
              <TextField
                select
                label="Игра"
                value={cheatFilters.gameId}
                onChange={(e) => setCheatFilters(prev => ({ ...prev, gameId: e.target.value }))}
                size="small"
                SelectProps={{ native: true }}
                sx={{ minWidth: 180,
                  '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15,17,21,0.5)', '& fieldset': { borderColor: '#2a2e36' }, '&.Mui-focused fieldset': { borderColor: '#7c9cff' } },
                  '& .MuiInputLabel-root': { color: '#b6bdc6' }, '& .MuiInputBase-input': { color: '#f5f5f5' }
                }}
              >
                <option value="">Все игры</option>
                {games.map(game => (
                  <option key={game.id} value={game.id} style={{ background: '#1a1c21', color: '#f5f5f5' }}>{game.name}</option>
                ))}
              </TextField>
              <Box>
                <Typography variant="body2" sx={{ color: '#b6bdc6' }}>Фильтр по тегам:</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                  {Array.from(new Set(cheats.flatMap(c => c.tags || []))).map((tag) => {
                    const isActive = cheatFilters.tags.includes(tag);
                    return (
                      <Chip
                        key={tag}
                        label={tag}
                        variant={isActive ? 'filled' : 'outlined'}
                        onClick={() => setCheatFilters(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
                        }))}
                        sx={isActive 
                          ? { bgcolor: '#ffffff', color: '#0b0d12', borderColor: '#ffffff' }
                          : { color: '#ffffff', borderColor: '#ffffff' }
                        }
                      />
                    );
                  })}
                  {cheatFilters.tags.length > 0 && (
                    <Chip label="Сбросить" onClick={() => setCheatFilters({ gameId: '', tags: [], query: '' })} sx={{ color: '#ffffff', borderColor: '#ffffff' }} variant="outlined" />
                  )}
                </Stack>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCheatDialog(true)}
              sx={{ bgcolor: '#7c9cff', color: '#0b0d12' }}
            >
              Добавить чит
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c' }}>
            <Table>
              <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#b6bdc6' }}>Изображение</TableCell>
                    <TableCell sx={{ color: '#b6bdc6' }}>Название</TableCell>
                    <TableCell sx={{ color: '#b6bdc6' }}>Игра</TableCell>
                    <TableCell sx={{ color: '#b6bdc6' }}>Описание</TableCell>
                    <TableCell sx={{ color: '#b6bdc6' }}>Теги</TableCell>
                    <TableCell sx={{ color: '#b6bdc6' }}>Скачивания</TableCell>
                    <TableCell sx={{ color: '#b6bdc6' }}>Действия</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                {cheats
                  .filter(c => !cheatFilters.gameId || c.gameId === cheatFilters.gameId)
                  .filter(c => cheatFilters.tags.length === 0 || (c.tags || []).some(t => cheatFilters.tags.includes(t)))
                  .filter(c => !cheatFilters.query || c.name.toLowerCase().includes(cheatFilters.query.toLowerCase()))
                  .map((cheat) => (
                  <TableRow key={cheat.id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={cheat.image}
                        alt={cheat.name}
                        sx={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#eaeaea' }}>{cheat.name}</TableCell>
                    <TableCell sx={{ color: '#eaeaea' }}>
                      {games.find(g => g.id === cheat.gameId)?.name || 'Неизвестно'}
                    </TableCell>
                    <TableCell sx={{ color: '#b6bdc6' }}>{cheat.description}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                        {(cheat.tags || []).map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: '#7c9cff' }}>{cheat.downloads.toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditCheat(cheat)} sx={{ color: '#7c9cff' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteCheat(cheat.id)} sx={{ color: '#ff4d4f' }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Диалог добавления/редактирования игры */}
      <Dialog open={gameDialog} onClose={() => setGameDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#eaeaea', bgcolor: '#1a1c21' }}>
          {editingGame ? 'Редактировать игру' : 'Добавить игру'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1c21' }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название игры"
              value={gameForm.name}
              onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            <TextField
              label="Описание"
              value={gameForm.description}
              onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ color: '#b6bdc6', mb: 1 }}>Изображение игры</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ 
                    color: '#7c9cff', 
                    borderColor: '#7c9cff',
                    '&:hover': { borderColor: '#6b8cff', background: 'rgba(124,156,255,0.1)' }
                  }}
                >
                  Загрузить файл
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        readFileAsDataUrl(file).then((dataUrl) => {
                          setGameImageFile(null);
                          setGameForm({ ...gameForm, image: dataUrl });
                        });
                      }
                    }}
                  />
                </Button>
                <Typography variant="body2" sx={{ color: '#b6bdc6' }}>или</Typography>
                <TextField
                  label="URL изображения"
                  value={gameForm.image}
                  onChange={(e) => {
                    setGameForm({ ...gameForm, image: e.target.value });
                    setGameImageFile(null);
                  }}
                  fullWidth
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      bgcolor: 'rgba(15,17,21,0.5)', 
                      '& fieldset': { borderColor: '#2a2e36' },
                      '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                    },
                    '& .MuiInputLabel-root': { color: '#b6bdc6' },
                    '& .MuiInputBase-input': { color: '#f5f5f5' }
                  }}
                />
              </Stack>
              {gameForm.image && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: '#b6bdc6', mb: 1 }}>Предварительный просмотр:</Typography>
                  <Box
                    component="img"
                    src={gameForm.image}
                    alt="Preview"
                    sx={{ 
                      width: 200, 
                      height: 120, 
                      objectFit: 'cover', 
                      borderRadius: 2, 
                      border: '1px solid #2a2e36' 
                    }}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1a1c21' }}>
          <Button onClick={() => setGameDialog(false)} sx={{ color: '#b6bdc6' }}>
            Отмена
          </Button>
          <Button onClick={handleAddGame} variant="contained" sx={{ bgcolor: '#7c9cff', color: '#0b0d12' }}>
            {editingGame ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления/редактирования чита */}
      <Dialog open={cheatDialog} onClose={() => setCheatDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#eaeaea', bgcolor: '#1a1c21' }}>
          {editingCheat ? 'Редактировать чит' : 'Добавить чит'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1c21' }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Игра"
              value={cheatForm.gameId}
              onChange={(e) => setCheatForm({ ...cheatForm, gameId: e.target.value })}
              fullWidth
              SelectProps={{ native: true }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            >
              <option value="">Выберите игру</option>
              {games.map((game) => (
                <option key={game.id} value={game.id} style={{ background: '#1a1c21', color: '#f5f5f5' }}>
                  {game.name}
                </option>
              ))}
            </TextField>
            <TextField
              label="Название чита"
              value={cheatForm.name}
              onChange={(e) => setCheatForm({ ...cheatForm, name: e.target.value })}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            <TextField
              label="Описание"
              value={cheatForm.description}
              onChange={(e) => setCheatForm({ ...cheatForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            <TextField
              label="URL для скачивания"
              value={cheatForm.url}
              onChange={(e) => setCheatForm({ ...cheatForm, url: e.target.value })}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ color: '#b6bdc6', mb: 1 }}>Теги (фильтры)</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {cheatForm.tags.map((tag, idx) => (
                  <Chip key={idx} label={tag} onDelete={() => setCheatForm({ ...cheatForm, tags: cheatForm.tags.filter((_, i) => i !== idx) })} />
                ))}
              </Stack>
              <TextField
                placeholder="Добавить тег и нажать Enter"
                onKeyDown={(e) => {
                  const input = (e.target as HTMLInputElement);
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = input.value.trim();
                    if (value && !cheatForm.tags.includes(value)) {
                      setCheatForm({ ...cheatForm, tags: [...cheatForm.tags, value] });
                    }
                    input.value = '';
                  }
                }}
                fullWidth
                size="small"
                sx={{ mt: 1,
                  '& .MuiOutlinedInput-root': { 
                    bgcolor: 'rgba(15,17,21,0.5)', 
                    '& fieldset': { borderColor: '#2a2e36' },
                    '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                  },
                  '& .MuiInputBase-input': { color: '#f5f5f5' }
                }}
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#b6bdc6', mb: 1 }}>Изображение чита</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ 
                    color: '#7c9cff', 
                    borderColor: '#7c9cff',
                    '&:hover': { borderColor: '#6b8cff', background: 'rgba(124,156,255,0.1)' }
                  }}
                >
                  Загрузить файл
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        readFileAsDataUrl(file).then((dataUrl) => {
                          setCheatImageFile(null);
                          setCheatForm({ ...cheatForm, image: dataUrl });
                        });
                      }
                    }}
                  />
                </Button>
                <Typography variant="body2" sx={{ color: '#b6bdc6' }}>или</Typography>
                <TextField
                  label="URL изображения"
                  value={cheatForm.image}
                  onChange={(e) => {
                    setCheatForm({ ...cheatForm, image: e.target.value });
                    setCheatImageFile(null);
                  }}
                  fullWidth
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      bgcolor: 'rgba(15,17,21,0.5)', 
                      '& fieldset': { borderColor: '#2a2e36' },
                      '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                    },
                    '& .MuiInputLabel-root': { color: '#b6bdc6' },
                    '& .MuiInputBase-input': { color: '#f5f5f5' }
                  }}
                />
              </Stack>
              {cheatForm.image && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: '#b6bdc6', mb: 1 }}>Предварительный просмотр:</Typography>
                  <Box
                    component="img"
                    src={cheatForm.image}
                    alt="Preview"
                    sx={{ 
                      width: 200, 
                      height: 120, 
                      objectFit: 'cover', 
                      borderRadius: 2, 
                      border: '1px solid #2a2e36' 
                    }}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1a1c21' }}>
          <Button onClick={() => setCheatDialog(false)} sx={{ color: '#b6bdc6' }}>
            Отмена
          </Button>
          <Button onClick={handleAddCheat} variant="contained" sx={{ bgcolor: '#7c9cff', color: '#0b0d12' }}>
            {editingCheat ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminPanel;
