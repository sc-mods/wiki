import {getLang, setLang, i18n} from './lang.js';

class ScLanguage extends HTMLElement {
  constructor() {
    super();
    this._onLanguageChange = this._updateUI.bind(this);
  }

  connectedCallback() {
    const currentLang = getLang();
    this.innerHTML = `
      <img id="lang-image" src="https://star-assets.github.io/lang/${currentLang.substring(0,2).toLowerCase()}.svg" alt="Language" title="Language">
      <ul class="language-dropdown-menu" role="menu">
        <li data-lang="pl"><img src="https://star-assets.github.io/lang/pl.svg" alt="Polski" title="Polski"></li>
        <li data-lang="fr"><img src="https://star-assets.github.io/lang/fr.svg" alt="Français" title="Français"></li>
        <li data-lang="es"><img src="https://star-assets.github.io/lang/es.svg" alt="Español" title="Español"></li>
        <li data-lang="en"><img src="https://star-assets.github.io/lang/en.svg" alt="English" title="English"></li>
        <li data-lang="ru"><img src="https://star-assets.github.io/lang/ru.svg" alt="Русский" title="Русский"></li>
        <li data-lang="kr"><img src="https://star-assets.github.io/lang/kr.svg" alt="한국어" title="한국어"></li>
        <li data-lang="cn"><img src="https://star-assets.github.io/lang/cn.svg" alt="简体中文" title="简体中文"></li>
      </ul>`

    // Attach event listeners to prevent default and change language
    this.querySelectorAll('li[data-lang]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const lang = link.getAttribute('data-lang');
        setLang(lang);
      });
    });


    window.addEventListener('languagechange', this._onLanguageChange)

  }

  disconnectedCallback() {
    window.removeEventListener('languagechange', this._onLanguageChange);
  }

  _updateUI() {
    let currentLang = getLang();
    if(currentLang == "enUS")currentLang = "enEN" //todo
    this.querySelector("#lang-image").setAttribute("src",`https://star-assets.github.io/lang/${currentLang.substring(2).toLowerCase()}.svg`)
  }
}

customElements.define('sc-language', ScLanguage);
