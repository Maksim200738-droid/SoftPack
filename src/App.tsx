import React, { useRef, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Stack, IconButton, Chip, useMediaQuery, Divider, Paper, InputBase, Avatar, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useParams } from 'react-router-dom';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EventIcon from '@mui/icons-material/Event';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { TextField, Alert } from '@mui/material';
import { useAuth } from './authContext';
import { useData, DataProvider } from './dataContext';
import { SEOHead, SEOConfigs } from './SEOHead';
import AdminPanel from './AdminPanel';

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const squares = useRef<{
    x: number;
    y: number;
    size: number;
    dx: number;
    dy: number;
    angle: number;
    dAngle: number;
    color: string;
  }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Цвета граней
    const colors = ['#00000055'];
    squares.current = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 60 + Math.random() * 60,
      dx: (Math.random() - 0.5) * 0.7,
      dy: (Math.random() - 0.5) * 0.7,
      angle: Math.random() * Math.PI * 2,
      dAngle: (Math.random() - 0.5) * 0.01,
      color: colors[0],
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const s of squares.current) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.beginPath();
        ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
        // Движение и вращение
        s.x += s.dx;
        s.y += s.dy;
        s.angle += s.dAngle;
        // Отскок от краёв
        if (s.x - s.size / 2 < 0 || s.x + s.size / 2 > width) s.dx *= -1;
        if (s.y - s.size / 2 < 0 || s.y + s.size / 2 > height) s.dy *= -1;
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    function handleResize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        zIndex: 0,
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  );
}


function Navbar() {
  const isMobile = useMediaQuery('(max-width:900px)');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const linkSx = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? '#ffffff' : '#e6e6e6',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 15,
    px: 1.5,
    textTransform: 'none',
    borderBottom: isActive ? '2px solid #7c9cff' : '2px solid transparent',
    borderRadius: 0,
    '&:hover': { color: '#fff', background: 'transparent' },
  });
  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 5, px: { xs: 1, sm: 2 }, pt: 2, pb: 1, backdropFilter: 'blur(6px)' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 0 } }}>
        <Paper elevation={0} sx={{ bgcolor: 'rgba(20,21,24,0.7)', border: '1px solid #23272f', borderRadius: 3, px: { xs: 1, sm: 2 }, py: 0.5 }}>
          <Toolbar sx={{ minHeight: 56, px: 0 }}>
            {/* Лого */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 1 }}>
              <Avatar sx={{ bgcolor: '#7c9cff', color: '#0b0d12', width: 28, height: 28, fontWeight: 800 }}>S</Avatar>
              <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, fontSize: 20, letterSpacing: 0.3 }}>SoftPack</Typography>
            </Stack>
            {/* Центр: поиск + ссылки */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                <Paper component="form" sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: 320, height: 36, bgcolor: '#0f1115', border: '1px solid #23272f', borderRadius: 2 }}>
                  <IconButton sx={{ p: '4px', color: '#8a94a4' }} aria-label="search">
                    <SearchIcon fontSize="small" />
                  </IconButton>
                  <InputBase sx={{ ml: 1, flex: 1, color: '#d7dde6', fontSize: 14 }} placeholder="Поиск игры..." />
                </Paper>
                <Stack direction="row" spacing={0.5}>
                  <Button component={NavLink} to="/" sx={linkSx as any}>Главная</Button>
                  <Button component={NavLink} to="/games" startIcon={<ViewModuleIcon sx={{ fontSize: 18 }} />} sx={linkSx as any}>Игры</Button>
                  <Button component={NavLink} to="/about" startIcon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />} sx={linkSx as any}>О нас</Button>
                  <Button component={NavLink} to="/events" startIcon={<EventIcon sx={{ fontSize: 18 }} />} sx={linkSx as any}>События</Button>
                </Stack>
              </Box>
            )}
            {/* Право: иконки */}
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 'auto' }}>
              <Tooltip title="Уведомления"><IconButton size="small" sx={{ color: '#b6bdc6' }}><NotificationsNoneIcon fontSize="small" /></IconButton></Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#23272f' }} />
              {user ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ color: '#e6e6e6', fontSize: 14, fontWeight: 600 }}>{user.name}</Typography>
                  {user.role === 'admin' && (
                    <Button 
                      color="inherit" 
                      onClick={() => navigate('/admin')} 
                      sx={{ color: '#7c9cff', fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 1.5, py: 0.5, '&:hover': { background: 'rgba(124,156,255,0.1)' } }}
                    >
                      Админ
                    </Button>
                  )}
                  <Button color="inherit" onClick={logout} sx={{ color: '#e6e6e6', fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 1.5, py: 0.5, '&:hover': { background: '#1c1f25' } }}>
                    Выйти
                  </Button>
                </Stack>
              ) : (
                <Button color="inherit" startIcon={<AccountCircleIcon />} onClick={() => navigate('/login')} sx={{ color: '#e6e6e6', fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 1.5, py: 0.5, '&:hover': { background: '#1c1f25' } }}>
                  Войти
                </Button>
              )}
              {isMobile && (
                <IconButton color="inherit" sx={{ ml: 0.5 }}>
                  <MenuIcon />
                </IconButton>
              )}
            </Stack>
          </Toolbar>
        </Paper>
      </Container>
    </Box>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactElement; title: string; desc: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ bgcolor: '#101317', border: '1px solid #23272f', borderRadius: 2, p: 1 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ color: '#eaeaea', fontWeight: 700, fontSize: 15 }}>{title}</Typography>
        <Typography sx={{ color: '#9aa3ad', fontSize: 13 }}>{desc}</Typography>
      </Box>
    </Stack>
  );
}

function MainPromo() {
  const navigate = useNavigate();
  const { settings } = useData();
  const extractYouTubeId = (url?: string): string | null => {
    if (!url) return null;
    const u = url.trim();
    // youtu.be/ID
    const short = u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
    // youtube.com/watch?v=ID
    const long = u.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
    // youtube.com/embed/ID
    const embed = u.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/i);
    // youtube.com/shorts/ID
    const shorts = u.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/i);
    return (short && short[1]) || (long && long[1]) || (embed && embed[1]) || (shorts && shorts[1]) || null;
  };
  const videoId = extractYouTubeId(settings.homepageVideoUrl);
  return (
    <Box sx={{ py: { xs: 5, md: 7 } }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ position: 'relative', overflow: 'hidden', borderRadius: 4, p: { xs: 3, md: 5 }, background: 'linear-gradient(135deg, #0f1115 0%, #151922 100%)', border: '1px solid #22252c' }}>
          <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 200px at 20% 20%, rgba(124,156,255,.12), transparent), radial-gradient(400px 160px at 80% 60%, rgba(255,77,79,.12), transparent)' }} />
          <Grid container spacing={3} alignItems="center" justifyContent="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2.5}>
                <Chip icon={<FlashOnIcon sx={{ color: '#7c9cff' }} />} label={<span style={{ color: '#7c9cff', fontWeight: 600 }}>Обновления каждую неделю</span>} sx={{ bgcolor: '#11141a', color: '#7c9cff', fontWeight: 600, fontSize: 13, px: 1.25, py: 1, borderRadius: 2, width: 'fit-content' }} />
                <Typography variant="h1" sx={{ fontWeight: 900, color: '#f5f7fb', lineHeight: 1.1, fontSize: { xs: 32, sm: 40, md: 48 } }}>
                  Софт для игр c безопасностью и удобством
                </Typography>
                <Typography variant="body1" sx={{ color: '#b6bdc6', maxWidth: 560, fontSize: { xs: 14, md: 16 } }}>
                  Подборки, быстрая установка и поддержка. Начните с выбора игры или посмотрите события.
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained" onClick={() => navigate('/games')} sx={{ bgcolor: '#7c9cff', color: '#0b0d12', fontWeight: 800, fontSize: 16, px: 3, py: 1.1, borderRadius: 2, boxShadow: '0 4px 14px #7c9cff44' }}>
                    Выбрать игру
                  </Button>
                  <Button variant="outlined" onClick={() => navigate('/events')} sx={{ color: '#e6e6e6', borderColor: '#2a2e36', fontWeight: 700, fontSize: 16, px: 3, py: 1.1, borderRadius: 2, background: 'rgba(255,255,255,0.01)', '&:hover': { background: '#1c1f25', borderColor: '#3a3f48' } }}>
                    События
                  </Button>
                </Stack>
                <Stack direction="row" spacing={3} sx={{ pt: 1 }}>
                  <Feature icon={<ShieldOutlinedIcon sx={{ color: '#9bd59b' }} />} title="Проверено" desc="Релизы проходят ручную проверку" />
                  <Feature icon={<StarBorderRoundedIcon sx={{ color: '#ffd480' }} />} title="Топ-подборки" desc="Лучшее из лучших по играм" />
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative', width: { xs: 320, sm: 420, md: 520 }, borderRadius: 3, overflow: 'hidden', border: '1px solid #22252c', boxShadow: '0 8px 36px #0009' }}>
                {videoId ? (
                  <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
                    <Box component="iframe"
                      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                      sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title="Видео"
                    />
                  </Box>
                ) : (
                  <img src="https://i.imgur.com/0y0y0y0.png" alt="Скриншот сайта" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }} />
                )}
                <Chip label="SOFTPACK v2" size="small" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700, fontSize: 12, borderRadius: 1.5, bgcolor: '#11141a', color: '#7c9cff', border: '1px solid #22252c' }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

function GamesGrid({ preview = false }: { preview?: boolean }) {
  const navigate = useNavigate();
  const { games } = useData();
  const list = preview ? games.slice(0, 3) : games;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Каталог игр с читами",
    "description": "Полный список игр с доступными читами",
    "numberOfItems": games.length,
    "itemListElement": games.map((game, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "VideoGame",
        "name": game.name,
        "description": game.description,
        "image": game.image,
        "url": `https://softpack.ru/game/${game.id}`
      }
    }))
  };

  return (
    <>
      {!preview && (
        <SEOHead 
          {...SEOConfigs.games}
          structuredData={structuredData}
        />
      )}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {!preview && (
          <Typography variant="h4" sx={{ color: '#f5f5f5', fontWeight: 800, mb: 3, fontSize: { xs: 22, md: 28 } }}>Выберите игру</Typography>
        )}
        <Grid container spacing={3}>
          {list.map((game) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={game.id}>
              <Box onClick={() => navigate(`/game/${game.id}`)}
                sx={{
                  bgcolor: '#1a1c21',
                  border: '1px solid #22252c',
                  borderRadius: 3,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform .2s, box-shadow .2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px #0007' },
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                <Box 
                  sx={{ height: 160, background: `url(${game.image}) center/cover` }} 
                  role="img"
                  aria-label={`${game.name} - ${game.description}`}
                />
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ color: '#eaeaea', fontWeight: 700, fontSize: 16, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{game.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#9aa3ad', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{game.description}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        {preview && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/games')} sx={{ color: '#e6e6e6', borderColor: '#2a2e36', fontWeight: 700, px: 3, py: 1, borderRadius: 2, '&:hover': { background: '#1c1f25', borderColor: '#3a3f48' } }}>
              Смотреть все игры
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}

function GameCheatsPage() {
  const { gameId } = useParams();
  const { games, getCheatsByGame } = useData();
  const navigate = useNavigate();
  const game = games.find((g) => g.id === gameId);
  const cheats = gameId ? getCheatsByGame(gameId) : [];
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const allTags = React.useMemo(
    () => Array.from(new Set(cheats.flatMap(c => (c.tags || [])))),
    [cheats]
  );
  const filteredCheats = React.useMemo(
    () => cheats
      .filter(c => selectedTags.length === 0 || (c.tags || []).some(t => selectedTags.includes(t)))
      .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [cheats, selectedTags, searchQuery]
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game?.name || 'Игра',
    "description": `Читы для ${game?.name || 'игры'}`,
    "image": game?.image,
    "url": `https://softpack.ru/game/${gameId}`,
    "genre": "Action",
    "keywords": allTags.join(', '),
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": "0",
      "priceCurrency": "RUB"
    },
    "hasPart": cheats.map(cheat => ({
      "@type": "SoftwareApplication",
      "name": cheat.name,
      "description": cheat.description,
      "url": `https://softpack.ru/cheat/${cheat.id}`,
      "image": cheat.image,
      "applicationCategory": "GameApplication",
      "operatingSystem": "Windows"
    }))
  };

  return (
    <>
      <SEOHead 
        title={`Читы для ${game?.name || 'игры'} - Скачать | SoftPack`}
        description={`Лучшие читы для ${game?.name || 'игры'}. ${cheats.length} проверенных читов с подробными инструкциями. Скачать бесплатно.`}
        keywords={`${game?.name}, читы, скачать, ${game?.name} читы, моды, хаки${allTags.length ? ', ' + allTags.join(', ') : ''}`}
        image={game?.image}
        url={`https://softpack.ru/game/${gameId}`}
        type="article"
        gameName={game?.name}
        structuredData={structuredData}
      />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <header>
          <Typography variant="h1" sx={{ color: '#f5f5f5', fontWeight: 800, mb: 3, fontSize: { xs: 22, md: 28 } }}>
            Читы для {game?.name || 'игры'}
          </Typography>
        </header>
        <main>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Поиск по названию чита"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: 260,
                '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15,17,21,0.5)', '& fieldset': { borderColor: '#2a2e36' }, '&.Mui-focused fieldset': { borderColor: '#7c9cff' } },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
          </Box>
          {allTags.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#b6bdc6', mb: 1 }}>Фильтр по тегам:</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {allTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <Chip
                      key={tag}
                      label={tag}
                      variant={isActive ? 'filled' : 'outlined'}
                      onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      sx={isActive 
                        ? { bgcolor: '#ffffff', color: '#0b0d12', borderColor: '#ffffff' }
                        : { color: '#ffffff', borderColor: '#ffffff' }
                      }
                    />
                  );
                })}
                {selectedTags.length > 0 && (
                  <Chip label="Сбросить" onClick={() => setSelectedTags([])} sx={{ color: '#ffffff', borderColor: '#ffffff' }} variant="outlined" />
                )}
              </Stack>
            </Box>
          )}
          <Grid container spacing={3}>
          {filteredCheats.map((cheat) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cheat.id}>
              <Box sx={{ bgcolor: '#1a1c21', border: '1px solid #22252c', borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {cheat.image && (
                  <Box 
                    sx={{ height: 160, background: `url(${cheat.image}) center/cover` }} 
                    role="img"
                    aria-label={`${cheat.name} - ${cheat.description}`}
                  />
                )}
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ color: '#eaeaea', fontWeight: 700, fontSize: 16, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cheat.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#9aa3ad', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cheat.description}</Typography>
                  {(cheat.tags && cheat.tags.length > 0) && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {cheat.tags.map((tag, idx) => (
                        <Chip key={idx} label={tag} size="small" variant="outlined" sx={{ color: '#ffffff', borderColor: '#ffffff' }} />
                      ))}
                    </Stack>
                  )}
                </Box>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    onClick={() => navigate(`/cheat/${cheat.id}`)} 
                    variant="contained" 
                    fullWidth 
                    sx={{ bgcolor: '#7c9cff', color: '#0b0d12', fontWeight: 800, borderRadius: 2 }}
                  >
                    Скачать
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
          </Grid>
        </main>
      </Container>
    </>
  );
}

function CheatPage() {
  const { cheatId } = useParams();
  const { cheats, games, incrementDownloads } = useData();
  const navigate = useNavigate();
  const cheat = cheats.find((c) => c.id === cheatId);
  const game = cheat ? games.find((g) => g.id === cheat.gameId) : null;
  const hasIncremented = React.useRef(false);
  const cheatTags = cheat?.tags || [];

  // Увеличиваем счетчик скачиваний только один раз при загрузке страницы
  React.useEffect(() => {
    if (cheat && !hasIncremented.current) {
      incrementDownloads(cheat.id);
      hasIncremented.current = true;
    }
  }, [cheat?.id, incrementDownloads]);

  if (!cheat) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#f5f5f5', fontWeight: 800, mb: 2 }}>Чит не найден</Typography>
        <Typography variant="body1" sx={{ color: '#b6bdc6', mb: 3 }}>
          Запрашиваемый чит не существует или был удален.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')} 
          sx={{ bgcolor: '#7c9cff', color: '#0b0d12', fontWeight: 800, borderRadius: 2 }}
        >
          На главную
        </Button>
      </Container>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": cheat.name,
    "description": cheat.description,
    "image": cheat.image,
    "url": `https://softpack.ru/cheat/${cheat.id}`,
    "applicationCategory": "GameApplication",
    "operatingSystem": "Windows",
    "keywords": cheatTags.join(', '),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SoftPack"
    },
    "datePublished": cheat.createdAt,
    "downloadUrl": cheat.url,
    "softwareVersion": "1.0.0",
    "fileSize": "2.5MB"
  };

  return (
    <>
      <SEOHead 
        title={`${cheat.name} для ${game?.name} - Скачать чит | SoftPack`}
        description={`Скачать ${cheat.name} для ${game?.name}. ${cheat.description} Бесплатно и безопасно.`}
        keywords={`${cheat.name}, ${game?.name}, скачать, чит, мод, хак${cheatTags.length ? ', ' + cheatTags.join(', ') : ''}`}
        image={cheat.image}
        url={`https://softpack.ru/cheat/${cheat.id}`}
        type="product"
        gameName={game?.name}
        cheatName={cheat.name}
        structuredData={structuredData}
      />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Button 
            onClick={() => navigate(-1)} 
            sx={{ color: '#7c9cff', mb: 2, textTransform: 'none' }}
          >
            ← Назад
          </Button>
        </Box>
        
        <Grid container spacing={4}>
        {/* Левая часть - изображение и основная информация */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ 
            bgcolor: '#1a1c21', 
            border: '1px solid #22252c', 
            borderRadius: 3, 
            overflow: 'hidden',
            mb: 3
          }}>
            {cheat.image && (
              <Box 
                sx={{ 
                  height: { xs: 200, md: 300 }, 
                  background: `url(${cheat.image}) center/cover` 
                }} 
                role="img"
                aria-label={`${cheat.name} - ${cheat.description}`}
              />
            )}
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ color: '#f5f5f5', fontWeight: 800, mb: 2 }}>
                {cheat.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#b6bdc6', mb: 3, lineHeight: 1.6 }}>
                {cheat.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={game?.name || 'Неизвестная игра'} 
                  sx={{ 
                    bgcolor: '#7c9cff', 
                    color: '#0b0d12', 
                    fontWeight: 600 
                  }} 
                />
                <Chip 
                  label={`${cheat.downloads} скачиваний`} 
                  sx={{ 
                    bgcolor: '#2a2e36', 
                    color: '#b6bdc6', 
                    fontWeight: 600 
                  }} 
                />
                <Chip 
                  label={`Добавлен ${cheat.createdAt}`} 
                  sx={{ 
                    bgcolor: '#2a2e36', 
                    color: '#b6bdc6', 
                    fontWeight: 600 
                  }} 
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Правая часть - кнопка скачивания и дополнительная информация */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ 
            bgcolor: '#1a1c21', 
            border: '1px solid #22252c', 
            borderRadius: 3, 
            p: 3,
            mb: 3
          }}>
            <Typography variant="h6" sx={{ color: '#f5f5f5', fontWeight: 700, mb: 2 }}>
              Скачать чит
            </Typography>
            <Typography variant="body2" sx={{ color: '#b6bdc6', mb: 3 }}>
              Нажмите кнопку ниже, чтобы перейти к скачиванию чита. 
              Убедитесь, что у вас установлена последняя версия игры.
            </Typography>
            <Button 
              href={cheat.url} 
              target="_blank"
              variant="contained" 
              fullWidth 
              sx={{ 
                bgcolor: '#7c9cff', 
                color: '#0b0d12', 
                fontWeight: 800, 
                fontSize: 18,
                py: 2,
                borderRadius: 2,
                mb: 2,
                boxShadow: '0 4px 14px rgba(124,156,255,0.4)',
                '&:hover': { 
                  bgcolor: '#6b8cff', 
                  boxShadow: '0 6px 20px rgba(124,156,255,0.5)' 
                }
              }}
            >
              📥 Скачать сейчас
            </Button>
            <Typography variant="caption" sx={{ color: '#8a94a4', display: 'block', textAlign: 'center' }}>
              Размер файла: ~2.5 MB • Версия: 1.0.0
            </Typography>
          </Box>

          {/* Информация о безопасности */}
          <Box sx={{ 
            bgcolor: '#1a1c21', 
            border: '1px solid #22252c', 
            borderRadius: 3, 
            p: 3
          }}>
            <Typography variant="h6" sx={{ color: '#f5f5f5', fontWeight: 700, mb: 2 }}>
              ⚠️ Важная информация
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: '#b6bdc6' }}>
                • Используйте на свой страх и риск
              </Typography>
              <Typography variant="body2" sx={{ color: '#b6bdc6' }}>
                • Создайте резервную копию сохранений
              </Typography>
              <Typography variant="body2" sx={{ color: '#b6bdc6' }}>
                • Отключите антивирус при установке
              </Typography>
              <Typography variant="body2" sx={{ color: '#b6bdc6' }}>
                • Не используйте в онлайн-режиме
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
      </Container>
    </>
  );
}

function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "О нас - SoftPack",
    "description": "Узнайте больше о SoftPack - каталоге проверенных читов для игр",
    "url": "https://softpack.ru/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "SoftPack",
      "description": "Каталог проверенных читов для популярных игр",
      "url": "https://softpack.ru",
      "foundingDate": "2024",
      "areaServed": "RU"
    }
  };

  return (
    <>
      <SEOHead 
        {...SEOConfigs.about}
        structuredData={structuredData}
      />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ color: '#f5f5f5', fontWeight: 800, mb: 2 }}>О нас</Typography>
        <Typography variant="body1" sx={{ color: '#b6bdc6' }}>
          SoftPack — каталог проверенных читов для популярных игр. Мы курируем подборки, следим за обновлениями и удобством использования.
        </Typography>
      </Container>
    </>
  );
}

function EventsPage() {
  const navigate = useNavigate();
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "События SoftPack",
    "description": "Следите за последними событиями и новостями SoftPack",
    "url": "https://softpack.ru/events",
    "organizer": {
      "@type": "Organization",
      "name": "SoftPack"
    },
    "eventStatus": "https://schema.org/EventScheduled"
  };

  return (
    <>
      <SEOHead 
        {...SEOConfigs.events}
        structuredData={structuredData}
      />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ color: '#f5f5f5', fontWeight: 800, mb: 2 }}>События</Typography>
        <Typography variant="body1" sx={{ color: '#b6bdc6', mb: 3 }}>
          Скоро: спец-ивенты, скидки и обновления. Подпишитесь, чтобы не пропустить.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/games')} sx={{ bgcolor: '#7c9cff', color: '#0b0d12', fontWeight: 800, borderRadius: 2 }}>
          Перейти к играм
        </Button>
      </Container>
    </>
  );
}

function HomePage() {
  const { games } = useData();
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SoftPack",
    "description": "Каталог проверенных читов для популярных игр",
    "url": "https://softpack.ru",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://softpack.ru/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SoftPack",
      "url": "https://softpack.ru"
    }
  };

  return (
    <>
      <SEOHead 
        {...SEOConfigs.home}
        structuredData={structuredData}
      />
      <MainPromo />
      <GamesGrid preview />
    </>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (e: any) {
      setError(e?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 400px at 30% 20%, rgba(124,156,255,.15), transparent), radial-gradient(500px 300px at 70% 80%, rgba(255,77,79,.15), transparent)' }} />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: '#7c9cff', color: '#0b0d12', width: 64, height: 64, fontWeight: 800, fontSize: 28, mx: 'auto', mb: 2 }}>S</Avatar>
          <Typography variant="h3" sx={{ color: '#f5f5f5', fontWeight: 800, mb: 1 }}>Добро пожаловать</Typography>
          <Typography variant="body1" sx={{ color: '#b6bdc6' }}>Войдите в свой аккаунт SoftPack</Typography>
        </Box>
        <Paper elevation={0} sx={{ bgcolor: 'rgba(26,28,33,0.8)', backdropFilter: 'blur(20px)', border: '1px solid #2a2e36', borderRadius: 4, p: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              fullWidth 
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&:hover fieldset': { borderColor: '#3a3f48' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            <TextField 
              label="Пароль" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              fullWidth 
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&:hover fieldset': { borderColor: '#3a3f48' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            {error && <Alert severity="error" sx={{ bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#ff6b6b' }}>{error}</Alert>}
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading} 
              sx={{ 
                bgcolor: '#7c9cff', 
                color: '#0b0d12', 
                fontWeight: 800, 
                fontSize: 16,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(124,156,255,0.4)',
                '&:hover': { bgcolor: '#6b8cff', boxShadow: '0 6px 20px rgba(124,156,255,0.5)' },
                '&:disabled': { bgcolor: '#4a5568', color: '#a0aec0' }
              }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
            <Divider sx={{ borderColor: '#2a2e36' }} />
            <Button 
              variant="outlined" 
              onClick={() => navigate('/register')} 
              sx={{ 
                color: '#e6e6e6', 
                borderColor: '#2a2e36', 
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                '&:hover': { 
                  background: 'rgba(124,156,255,0.1)', 
                  borderColor: '#7c9cff',
                  color: '#7c9cff'
                }
              }}
            >
              Создать аккаунт
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!name.trim()) throw new Error('Введите имя');
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (e: any) {
      setError(e?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 400px at 30% 20%, rgba(124,156,255,.15), transparent), radial-gradient(500px 300px at 70% 80%, rgba(255,77,79,.15), transparent)' }} />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: '#7c9cff', color: '#0b0d12', width: 64, height: 64, fontWeight: 800, fontSize: 28, mx: 'auto', mb: 2 }}>S</Avatar>
          <Typography variant="h3" sx={{ color: '#f5f5f5', fontWeight: 800, mb: 1 }}>Создать аккаунт</Typography>
          <Typography variant="body1" sx={{ color: '#b6bdc6' }}>Присоединяйтесь к SoftPack</Typography>
        </Box>
        <Paper elevation={0} sx={{ bgcolor: 'rgba(26,28,33,0.8)', backdropFilter: 'blur(20px)', border: '1px solid #2a2e36', borderRadius: 4, p: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
              label="Имя" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              fullWidth 
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&:hover fieldset': { borderColor: '#3a3f48' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            <TextField 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              fullWidth 
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&:hover fieldset': { borderColor: '#3a3f48' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            <TextField 
              label="Пароль" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              fullWidth 
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(15,17,21,0.5)', 
                  '& fieldset': { borderColor: '#2a2e36' },
                  '&:hover fieldset': { borderColor: '#3a3f48' },
                  '&.Mui-focused fieldset': { borderColor: '#7c9cff' }
                },
                '& .MuiInputLabel-root': { color: '#b6bdc6' },
                '& .MuiInputBase-input': { color: '#f5f5f5' }
              }}
            />
            {error && <Alert severity="error" sx={{ bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#ff6b6b' }}>{error}</Alert>}
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading} 
              sx={{ 
                bgcolor: '#7c9cff', 
                color: '#0b0d12', 
                fontWeight: 800, 
                fontSize: 16,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(124,156,255,0.4)',
                '&:hover': { bgcolor: '#6b8cff', boxShadow: '0 6px 20px rgba(124,156,255,0.5)' },
                '&:disabled': { bgcolor: '#4a5568', color: '#a0aec0' }
              }}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            <Divider sx={{ borderColor: '#2a2e36' }} />
            <Button 
              variant="outlined" 
              onClick={() => navigate('/login')} 
              sx={{ 
                color: '#e6e6e6', 
                borderColor: '#2a2e36', 
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                '&:hover': { 
                  background: 'rgba(124,156,255,0.1)', 
                  borderColor: '#7c9cff',
                  color: '#7c9cff'
                }
              }}
            >
              Уже есть аккаунт? Войти
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <DataProvider>
      <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', color: '#fff', position: 'relative', zIndex: 1 }}>
        <AnimatedBackground />
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<GamesGrid />} />
            <Route path="/game/:gameId" element={<GameCheatsPage />} />
            <Route path="/cheat/:cheatId" element={<CheatPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Router>
      </Box>
    </DataProvider>
  );
}

export default App;
