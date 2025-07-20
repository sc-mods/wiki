export let LANG = localStorage.getItem('app-lang') || 'enUS';


let land_data = {}
fetch('./src/lang.json')
  .then(response => response.json())
  .then(json => {
    land_data = json
  })
  .catch(err => console.error('Error loading JSON:', err));


const listeners = new Set();

export function setLang(lang) {

  let shortcuts = {
    ru: "ruRU",
    en: "enUS",
    us: "enUS",
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


export function i18n(text) {
  if (!text) return '';

  // If the text is a translation object, return matching lang
  if (typeof text === 'object') {
    return text[LANG] || text.enUS || Object.values(text)[0] || '';
  }

  let key = text.toLowerCase()
  // If it's a key in staticStrings
  if (land_data[key]) {
    return land_data[key][LANG] || Object.values(land_data[key])[0] || '';
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
