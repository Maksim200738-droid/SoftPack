import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Типы данных
export type Game = {
  id: string;
  name: string;
  description: string;
  image: string;
  downloads: number;
  createdAt: string;
};

export type Cheat = {
  id: string;
  gameId: string;
  name: string;
  description: string;
  url: string;
  image: string;
  downloads: number;
  createdAt: string;
  tags: string[];
};

export type SiteSettings = {
  homepageVideoUrl?: string;
};

// Моковые данные
const mockGames: Game[] = [
  { id: '1', name: 'CS:GO', description: 'Counter-Strike: Global Offensive', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', downloads: 1250, createdAt: '2024-01-15' },
  { id: '2', name: 'Valorant', description: 'Valorant', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg', downloads: 980, createdAt: '2024-01-20' },
  { id: '3', name: 'GTA V', description: 'Grand Theft Auto V', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg', downloads: 2100, createdAt: '2024-01-10' },
];

const mockCheats: Cheat[] = [
  { id: '1', gameId: '1', name: 'Aimbot Pro', description: 'Мощный аимбот для CS:GO', url: '#', image: 'https://i.imgur.com/placeholder1.jpg', downloads: 450, createdAt: '2024-01-16', tags: ['aimbot', 'legit'] },
  { id: '2', gameId: '1', name: 'Wallhack X', description: 'Видеть врагов сквозь стены', url: '#', image: 'https://i.imgur.com/placeholder2.jpg', downloads: 320, createdAt: '2024-01-17', tags: ['wallhack', 'visual'] },
  { id: '3', gameId: '2', name: 'ESP Vision', description: 'Показывает врагов и предметы', url: '#', image: 'https://i.imgur.com/placeholder3.jpg', downloads: 280, createdAt: '2024-01-21', tags: ['esp', 'visual'] },
  { id: '4', gameId: '3', name: 'Money Hack', description: 'Добавляет деньги в GTA V', url: '#', image: 'https://i.imgur.com/placeholder4.jpg', downloads: 890, createdAt: '2024-01-11', tags: ['money', 'economy'] },
];

// Функции для работы с localStorage
const readGames = (): Game[] => {
  try {
    const stored = localStorage.getItem('adminGames');
    return stored ? JSON.parse(stored) : mockGames;
  } catch {
    return mockGames;
  }
};

const writeGames = (games: Game[]) => {
  localStorage.setItem('adminGames', JSON.stringify(games));
};

const readCheats = (): Cheat[] => {
  try {
    const stored = localStorage.getItem('adminCheats');
    const parsed: any[] = stored ? JSON.parse(stored) : mockCheats;
    // Нормализуем структуру: гарантируем наличие поля tags
    return parsed.map((c) => ({
      ...c,
      tags: Array.isArray(c.tags) ? c.tags : []
    }));
  } catch {
    return mockCheats;
  }
};

const writeCheats = (cheats: Cheat[]) => {
  localStorage.setItem('adminCheats', JSON.stringify(cheats));
};

const readSettings = (): SiteSettings => {
  try {
    const stored = localStorage.getItem('siteSettings');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const writeSettings = (settings: SiteSettings) => {
  localStorage.setItem('siteSettings', JSON.stringify(settings));
};

// Контекст
interface DataContextType {
  games: Game[];
  cheats: Cheat[];
  settings: SiteSettings;
  setGames: (games: Game[]) => void;
  setCheats: (cheats: Cheat[]) => void;
  setSettings: (settings: SiteSettings) => void;
  updateSettings: (partial: Partial<SiteSettings>) => void;
  addGame: (game: Omit<Game, 'id' | 'downloads' | 'createdAt'>) => void;
  addCheat: (cheat: Omit<Cheat, 'id' | 'downloads' | 'createdAt'>) => void;
  updateGame: (id: string, game: Partial<Game>) => void;
  updateCheat: (id: string, cheat: Partial<Cheat>) => void;
  deleteGame: (id: string) => void;
  deleteCheat: (id: string) => void;
  getCheatsByGame: (gameId: string) => Cheat[];
  incrementDownloads: (cheatId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [games, setGamesState] = useState<Game[]>(readGames());
  const [cheats, setCheatsState] = useState<Cheat[]>(readCheats());
  const [settings, setSettingsState] = useState<SiteSettings>(readSettings());

  const setGames = (newGames: Game[]) => {
    setGamesState(newGames);
    writeGames(newGames);
  };

  const setCheats = (newCheats: Cheat[]) => {
    setCheatsState(newCheats);
    writeCheats(newCheats);
  };

  const setSettings = (newSettings: SiteSettings) => {
    setSettingsState(newSettings);
    writeSettings(newSettings);
  };

  const updateSettings = (partial: Partial<SiteSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      writeSettings(next);
      return next;
    });
  };

  const addGame = (gameData: Omit<Game, 'id' | 'downloads' | 'createdAt'>) => {
    const newGame: Game = {
      ...gameData,
      id: String(Date.now()),
      downloads: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updatedGames = [...games, newGame];
    setGames(updatedGames);
  };

  const addCheat = (cheatData: Omit<Cheat, 'id' | 'downloads' | 'createdAt'>) => {
    const newCheat: Cheat = {
      ...cheatData,
      id: String(Date.now()),
      downloads: 0,
      createdAt: new Date().toISOString().split('T')[0],
      tags: cheatData.tags ?? []
    };
    const updatedCheats = [...cheats, newCheat];
    setCheats(updatedCheats);
  };

  const updateGame = (id: string, gameData: Partial<Game>) => {
    const updatedGames = games.map(game => 
      game.id === id ? { ...game, ...gameData } : game
    );
    setGames(updatedGames);
  };

  const updateCheat = (id: string, cheatData: Partial<Cheat>) => {
    const updatedCheats = cheats.map(cheat => 
      cheat.id === id ? { ...cheat, ...cheatData } : cheat
    );
    setCheats(updatedCheats);
  };

  const deleteGame = (id: string) => {
    const updatedGames = games.filter(game => game.id !== id);
    const updatedCheats = cheats.filter(cheat => cheat.gameId !== id);
    setGames(updatedGames);
    setCheats(updatedCheats);
  };

  const deleteCheat = (id: string) => {
    const updatedCheats = cheats.filter(cheat => cheat.id !== id);
    setCheats(updatedCheats);
  };

  const getCheatsByGame = (gameId: string) => {
    return cheats.filter(cheat => cheat.gameId === gameId);
  };

  const incrementDownloads = React.useCallback((cheatId: string) => {
    setCheatsState((prevCheats: Cheat[]) => {
      const updatedCheats = prevCheats.map((cheat: Cheat) => 
        cheat.id === cheatId 
          ? { ...cheat, downloads: cheat.downloads + 1 }
          : cheat
      );
      writeCheats(updatedCheats);
      return updatedCheats;
    });
  }, []);

  const value: DataContextType = {
    games,
    cheats,
    settings,
    setGames,
    setCheats,
    setSettings,
    updateSettings,
    addGame,
    addCheat,
    updateGame,
    updateCheat,
    deleteGame,
    deleteCheat,
    getCheatsByGame,
    incrementDownloads
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
