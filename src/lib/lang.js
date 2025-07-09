export let LANG = localStorage.getItem('app-lang') || 'enUS';

const listeners = new Set();

export function setLang(lang) {

  let shortcuts = {
    ru: "ruRU",
    en: "enUS",
    kr: "koKR",
    cn: "zhCN",
    tw: "zhTW",
    pl: "plPL",
    fr: "frFR",
    es: "esES",
    mx: "esMX",
  }
  if(shortcuts[lang.toLowerCase()]){
    lang = shortcuts[lang.toLowerCase()]
  }
  if (lang !== LANG) {
    LANG = lang;
    localStorage.setItem('app-lang', lang);
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
    listeners.forEach(cb => cb(lang));
  }
}

const staticStrings = {
  'command-card': {
    enUS: 'Command Card',
    ruRU: 'Командная панель',
    koKR: '명령 카드',
    zhCN: '指令卡',
    zhTW: '指令卡',
    plPL: 'Karta poleceń',
    frFR: 'Carte de commande',
    esES: 'Panel de comandos',
    esMX: 'Panel de comandos'
  },'stats': {
    enUS: 'Stats',
    ruRU: 'Характеристики',
    koKR: '능력치',
    zhCN: '属性',
    zhTW: '屬性',
    plPL: 'Statystyki',
    frFR: 'Caractéristiques',
    esES: 'Estadísticas',
    esMX: 'Estadísticas',
  },

  'select-mod': {
    enUS: 'Mod',
    ruRU: 'Модификация',
    koKR: '모드',
    zhCN: '模组',
    zhTW: '模組',
    plPL: 'Mod',
    frFR: 'Mod',
    esES: 'Mod',
    esMX: 'Mod'
  },
  'army': {
    enUS: 'Units',
    ruRU: 'Юниты',
    koKR: '유닛',
    zhCN: '单位',
    zhTW: '單位',
    plPL: 'Jednostki',
    frFR: 'Unités',
    esES: 'Unidades',
    esMX: 'Unidades'
  },
  'structures': {
    enUS: 'Structures',
    ruRU: 'Здания',
    koKR: '건물',
    zhCN: '建筑',
    zhTW: '建築',
    plPL: 'Budynki',
    frFR: 'Structures',
    esES: 'Estructuras',
    esMX: 'Estructuras'
  },
  'upgrades': {
    enUS: 'Upgrades',
    ruRU: 'Улучшения',
    koKR: '업그레이드',
    zhCN: '升级',
    zhTW: '升級',
    plPL: 'Ulepszenia',
    frFR: 'Améliorations',
    esES: 'Mejoras',
    esMX: 'Mejoras'
  },
  'factions': {
    enUS: 'Faction',
    ruRU: 'Фракция',
    koKR: '진영',
    zhCN: '阵营',
    zhTW: '陣營',
    plPL: 'Frakcja',
    frFR: 'Faction',
    esES: 'Facción',
    esMX: 'Facción'
  },
  'language-label': {
    enUS: 'Language',
    ruRU: 'Язык',
    koKR: '언어',
    zhCN: '语言',
    zhTW: '語言',
    plPL: 'Język',
    frFR: 'Langue',
    esES: 'Idioma',
    esMX: 'Idioma'
  },
  'weapon-stats': {
    enUS: 'Weapon Stats',
    ruRU: 'Характеристики оружия',
    koKR: '무기 스탯',
    zhCN: '武器属性',
    zhTW: '武器屬性',
    plPL: 'Statystyki broni',
    frFR: 'Statistiques d\'arme',
    esES: 'Estadísticas de arma',
    esMX: 'Estadísticas de arma'
  },
  'command-panel': {
    enUS: 'Command Panel',
    ruRU: 'Командная панель',
    koKR: '명령 패널',
    zhCN: '指挥面板',
    zhTW: '指揮面板',
    plPL: 'Panel dowodzenia',
    frFR: 'Panneau de commande',
    esES: 'Panel de mando',
    esMX: 'Panel de mando'
  },
  'manufacturer': {
    enUS: 'Manufacturer',
    ruRU: 'Производитель',
    koKR: '제조사',
    zhCN: '制造商',
    zhTW: '製造商',
    plPL: 'Producent',
    frFR: 'Fabricant',
    esES: 'Fabricante',
    esMX: 'Fabricante'
  },
  'production': {
    enUS: 'Production',
    ruRU: 'Производство',
    koKR: '생산',
    zhCN: '生产',
    zhTW: '生產',
    plPL: 'Produkcja',
    frFR: 'Production',
    esES: 'Producción',
    esMX: 'Producción'
  },
  'morphs': {
    enUS: 'Morphs',
    ruRU: 'Морфы',
    koKR: '변태',
    zhCN: '变形',
    zhTW: '變形',
    plPL: 'Przemiany',
    frFR: 'Transformations',
    esES: 'Transformaciones',
    esMX: 'Transformaciones'
  },
  'biological': {
    enUS: 'Biological',
    ruRU: 'Биологический',
    koKR: '생체',
    zhCN: '生物',
    zhTW: '生物',
    plPL: 'Biologiczny',
    frFR: 'Biologique',
    esES: 'Biológico',
    esMX: 'Biológico'
  },
  'mechanical': {
    enUS: 'Mechanical',
    ruRU: 'Механический',
    koKR: '기계',
    zhCN: '机械',
    zhTW: '機械',
    plPL: 'Mechaniczny',
    frFR: 'Mécanique',
    esES: 'Mecánico',
    esMX: 'Mecánico'
  },
  'psionic': {
    enUS: 'Psionic',
    ruRU: 'Псионный',
    koKR: '사이오닉',
    zhCN: '灵能',
    zhTW: '靈能',
    plPL: 'Psioniczny',
    frFR: 'Psionique',
    esES: 'Psiónico',
    esMX: 'Psiónico'
  },
  'structure': {
    enUS: 'Structure',
    ruRU: 'Структура',
    koKR: '구조물',
    zhCN: '建筑',
    zhTW: '建築',
    plPL: 'Struktura',
    frFR: 'Structure',
    esES: 'Estructura',
    esMX: 'Estructura'
  },
  'hover': {
    enUS: 'Hover',
    ruRU: 'Парящий',
    koKR: '호버',
    zhCN: '悬浮',
    zhTW: '懸浮',
    plPL: 'Lewitujący',
    frFR: 'En lévitation',
    esES: 'Flotante',
    esMX: 'Flotante'
  },
  'hero': {
    enUS: 'Hero',
    ruRU: 'Герой',
    koKR: '영웅',
    zhCN: '英雄',
    zhTW: '英雄',
    plPL: 'Bohater',
    frFR: 'Héros',
    esES: 'Héroe',
    esMX: 'Héroe'
  },
  'robotic': {
    enUS: 'Robotic',
    ruRU: 'Робототехника',
    koKR: '로봇',
    zhCN: '机器人',
    zhTW: '機器人',
    plPL: 'Robotyczny',
    frFR: 'Robotique',
    esES: 'Robótico',
    esMX: 'Robótico'
  },
  'summoned': {
    enUS: 'Summoned',
    ruRU: 'Призванный',
    koKR: '소환된',
    zhCN: '召唤',
    zhTW: '召喚',
    plPL: 'Przyzwany',
    frFR: 'Invoqué',
    esES: 'Invocado',
    esMX: 'Invocado'
  },
  'light': {
    enUS: 'Light',
    ruRU: 'Лёгкий',
    koKR: '경장갑',
    zhCN: '轻型',
    zhTW: '輕型',
    plPL: 'Lekki',
    frFR: 'Léger',
    esES: 'Ligero',
    esMX: 'Ligero'
  },
  'armored': {
    enUS: 'Armored',
    ruRU: 'Бронированный',
    koKR: '중장갑',
    zhCN: '重型',
    zhTW: '重型',
    plPL: 'Opancerzony',
    frFR: 'Blindé',
    esES: 'Blindado',
    esMX: 'Blindado'
  },
  'massive': {
    enUS: 'Massive',
    ruRU: 'Массивный',
    koKR: '거대',
    zhCN: '巨型',
    zhTW: '巨型',
    plPL: 'Ogromny',
    frFR: 'Massif',
    esES: 'Masivo',
    esMX: 'Masivo'
  },
  'model': { enUS: 'Model', ruRU: 'Модель', koKR: '모델', zhCN: '模型', zhTW: '模型', plPL: 'Model', frFR: 'Modèle', esES: 'Modelo', esMX: 'Modelo' },

  'cargosize': { enUS: 'Cargo Size', ruRU: 'Размер груза', koKR: '적재 크기', zhCN: '载货量', zhTW: '載貨量', plPL: 'Ładowność', frFR: 'Capacité', esES: 'Carga', esMX: 'Carga' },

  'flagarray': { enUS: 'Flags', ruRU: 'Флаги', koKR: '플래그', zhCN: '标志', zhTW: '標誌', plPL: 'Flagi', frFR: 'Drapeaux', esES: 'Banderas', esMX: 'Banderas' },

  'planearray': { enUS: 'Planes', ruRU: 'Плоскости', koKR: '평면', zhCN: '平面', zhTW: '平面', plPL: 'Płaszczyzny', frFR: 'Plans', esES: 'Planos', esMX: 'Planos' },

  'sight': { enUS: 'Sight', ruRU: 'Обзор', koKR: '시야', zhCN: '视野', zhTW: '視野', plPL: 'Zasięg widzenia', frFR: 'Vision', esES: 'Visión', esMX: 'Visión' },

  'speed': { enUS: 'Speed', ruRU: 'Скорость', koKR: '속도', zhCN: '速度', zhTW: '速度', plPL: 'Prędkość', frFR: 'Vitesse', esES: 'Velocidad', esMX: 'Velocidad' },

  'air': { enUS: 'Air', ruRU: 'Воздух', koKR: '공중', zhCN: '空中', zhTW: '空中', plPL: 'Powietrze', frFR: 'Air', esES: 'Aéreo', esMX: 'Aéreo' },

  'ground': { enUS: 'Ground', ruRU: 'Земля', koKR: '지상', zhCN: '地面', zhTW: '地面', plPL: 'Ziemia', frFR: 'Sol', esES: 'Terrestre', esMX: 'Terrestre' },

  'range': { enUS: 'Range', ruRU: 'Дальность', koKR: '사거리', zhCN: '射程', zhTW: '射程', plPL: 'Zasięg', frFR: 'Portée', esES: 'Alcance', esMX: 'Alcance' },

  'period': { enUS: 'Period', ruRU: 'Период', koKR: '주기', zhCN: '周期', zhTW: '週期', plPL: 'Okres', frFR: 'Période', esES: 'Periodo', esMX: 'Periodo' },

  'damage': { enUS: 'Damage', ruRU: 'Урон', koKR: '피해', zhCN: '伤害', zhTW: '傷害', plPL: 'Obrażenia', frFR: 'Dégâts', esES: 'Daño', esMX: 'Daño' },

  'backswing': { enUS: 'Backswing', ruRU: 'Задержка после атаки', koKR: '백스윙', zhCN: '后摇', zhTW: '後搖', plPL: 'Opóźnienie po ataku', frFR: 'Retrait', esES: 'Retraso postataque', esMX: 'Retraso postataque' },

  'damagepoint': { enUS: 'Damage Point', ruRU: 'Момент нанесения урона', koKR: '데미지 포인트', zhCN: '伤害点', zhTW: '傷害點', plPL: 'Moment obrażeń', frFR: 'Point de dégât', esES: 'Momento del daño', esMX: 'Momento del daño' },

  'kind': { enUS: 'Kind', ruRU: 'Тип', koKR: '종류', zhCN: '种类', zhTW: '種類', plPL: 'Rodzaj', frFR: 'Type', esES: 'Tipo', esMX: 'Tipo' },

  'buildtime': { enUS: 'Build Time', ruRU: 'Время постройки', koKR: '건설 시간', zhCN: '建造时间', zhTW: '建造時間', plPL: 'Czas budowy', frFR: 'Temps de construction', esES: 'Tiempo de construcción', esMX: 'Tiempo de construcción' },

  'armyselect': { enUS: 'Army Select', ruRU: 'Выбор армии', koKR: '군대 선택', zhCN: '部队选择', zhTW: '部隊選擇', plPL: 'Wybór armii', frFR: 'Sélection armée', esES: 'Selección de ejército', esMX: 'Selección de ejército' },

  'preventdefeat': { enUS: 'Prevent Defeat', ruRU: 'Предотвратить поражение', koKR: '패배 방지', zhCN: '防止失败', zhTW: '防止失敗', plPL: 'Zapobiegaj porażce', frFR: 'Empêcher la défaite', esES: 'Prevenir derrota', esMX: 'Prevenir derrota' },

  'penaltyrevealed': { enUS: 'Penalty Revealed', ruRU: 'Штраф за обнаружение', koKR: '패널티 공개됨', zhCN: '惩罚已暴露', zhTW: '懲罰已暴露', plPL: 'Kara ujawniona', frFR: 'Pénalité révélée', esES: 'Penalización revelada', esMX: 'Penalización revelada' },

  'footprint': { enUS: 'Footprint', ruRU: 'Размер базы', koKR: '차지 범위', zhCN: '占地', zhTW: '佔地', plPL: 'Rozmiar pola', frFR: 'Empreinte', esES: 'Huella', esMX: 'Huella' },

  'preventreveal': { enUS: 'Prevent Reveal', ruRU: 'Предотвратить обнаружение', koKR: '노출 방지', zhCN: '防止暴露', zhTW: '防止暴露', plPL: 'Zapobiegaj ujawnieniu', frFR: 'Empêcher révélation', esES: 'Evitar revelar', esMX: 'Evitar revelar' },
  'minerals': {
    enUS: 'Minerals',
    ruRU: 'Минералы',
    koKR: '광물',
    zhCN: '矿物',
    zhTW: '礦物',
    plPL: 'Minerały',
    frFR: 'Minerais',
    esES: 'Minerales',
    esMX: 'Minerales',
  },

  'vespene': {
    enUS: 'Vespene',
    ruRU: 'Веспен',
    koKR: '베스핀',
    zhCN: '瓦斯',
    zhTW: '瓦斯',
    plPL: 'Vespene',
    frFR: 'Vespène',
    esES: 'Vespeno',
    esMX: 'Vespeno',
  },

  'food': {
    enUS: 'Food',
    ruRU: 'Лимит',
    koKR: '보급',
    zhCN: '补给',
    zhTW: '補給',
    plPL: 'Populacja',
    frFR: 'Population',
    esES: 'Suministros',
    esMX: 'Suministros',
  },

};


export function i18n(text) {
  if (!text) return '';

  // If the text is a translation object, return matching lang
  if (typeof text === 'object') {
    return text[LANG] || text.enUS || Object.values(text)[0] || '';
  }

  let key = text.toLowerCase()
  // If it's a key in staticStrings
  if (staticStrings[key]) {
    return staticStrings[key][LANG] || Object.values(staticStrings[key])[0] || '';
  }

  return text; // fallback: assume plain string
}

export function getLang() {
  return LANG;
}

export function onLangChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
