import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  gameName?: string;
  cheatName?: string;
  structuredData?: any;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'SoftPack - Каталог читов для игр',
  description = 'SoftPack - лучший каталог проверенных читов для популярных игр. CS:GO, Valorant, GTA V и другие. Безопасные читы с подробными инструкциями.',
  keywords = 'читы, читы для игр, CS:GO читы, Valorant читы, GTA V читы, скачать читы, игровые читы, моды для игр',
  image = 'https://i.imgur.com/0y0y0y0.png',
  url = 'https://softpack.ru',
  type = 'website',
  gameName,
  cheatName,
  structuredData
}) => {
  const fullTitle = cheatName 
    ? `${cheatName} для ${gameName} - Скачать чит | SoftPack`
    : gameName 
    ? `Читы для ${gameName} - Скачать | SoftPack`
    : title;

  const fullDescription = cheatName
    ? `Скачать ${cheatName} для ${gameName}. ${description}`
    : gameName
    ? `Лучшие читы для ${gameName}. ${description}`
    : description;

  const fullKeywords = cheatName
    ? `${cheatName}, ${gameName}, читы, скачать, ${keywords}`
    : gameName
    ? `${gameName}, читы, скачать, ${keywords}`
    : keywords;

  useEffect(() => {
    // Обновляем title
    document.title = fullTitle;

    // Обновляем мета-теги
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Основные мета-теги
    updateMetaTag('description', fullDescription);
    updateMetaTag('keywords', fullKeywords);
    updateMetaTag('author', 'SoftPack Team');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('theme-color', '#7c9cff');
    updateMetaTag('msapplication-TileColor', '#7c9cff');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');

    // Open Graph мета-теги
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', fullDescription, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:site_name', 'SoftPack', true);
    updateMetaTag('og:locale', 'ru_RU', true);

    // Twitter Card мета-теги
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', fullDescription);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@softpack');
    updateMetaTag('twitter:creator', '@softpack');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Структурированные данные JSON-LD
    if (structuredData) {
      // Удаляем старые JSON-LD скрипты
      const oldScripts = document.querySelectorAll('script[type="application/ld+json"]');
      oldScripts.forEach(script => script.remove());

      // Добавляем новый
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [fullTitle, fullDescription, fullKeywords, image, url, type, structuredData]);

  return null; // Этот компонент не рендерит ничего видимого
};

// Предустановленные конфигурации для разных страниц
export const SEOConfigs = {
  home: {
    title: 'SoftPack - Каталог читов для игр',
    description: 'SoftPack - лучший каталог проверенных читов для популярных игр. CS:GO, Valorant, GTA V и другие. Безопасные читы с подробными инструкциями.',
    keywords: 'читы, читы для игр, CS:GO читы, Valorant читы, GTA V читы, скачать читы, игровые читы, моды для игр',
    type: 'website' as const
  },
  games: {
    title: 'Все игры - Каталог читов | SoftPack',
    description: 'Полный каталог игр с читами. Выберите игру и скачайте лучшие читы для CS:GO, Valorant, GTA V и других популярных игр.',
    keywords: 'каталог игр, читы для всех игр, CS:GO, Valorant, GTA V, Fortnite, скачать читы',
    type: 'website' as const
  },
  about: {
    title: 'О нас - SoftPack',
    description: 'Узнайте больше о SoftPack - каталоге проверенных читов для игр. Наша миссия - предоставить безопасные и качественные читы.',
    keywords: 'о нас, SoftPack, каталог читов, безопасные читы, качество',
    type: 'website' as const
  },
  events: {
    title: 'События и новости - SoftPack',
    description: 'Следите за последними событиями и новостями SoftPack. Обновления читов, новые релизы и специальные предложения.',
    keywords: 'события, новости, обновления читов, релизы, SoftPack',
    type: 'website' as const
  },
  admin: {
    title: 'Админ-панель - SoftPack',
    description: 'Панель управления контентом SoftPack',
    keywords: 'админ, управление, SoftPack',
    type: 'website' as const
  }
};
