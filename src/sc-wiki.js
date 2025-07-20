import './sc-language.js';
import './sc-mods.js';
import './sc-factions.js';
import './sc-list.js';
import './sc-unit.js';
import './sc-upgrade.js';
import './sc-icon.js';
import './sc-race.js';
import './sc-model.js';
import './sc-card.js';
import './sc-upload.js';
import './sc-weapon.js';
import './sc-button.js';
// import './parser/index.js';
import {Core} from "./data.js";



class ScWiki extends Core {
  constructor() {
    super();
  }

  connectedCallback() {


    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          // i18n processing
          if (node.hasAttribute('i18n'))
            setTranslatedText(node, 'i18n', 'innerHTML');

          if (node.hasAttribute('i18n-title'))
            setTranslatedText(node, 'i18n-title', 'title');

          const descendantsI18n = node.querySelectorAll('[i18n]');
          descendantsI18n.forEach(el =>
            setTranslatedText(el, 'i18n', 'innerHTML')
          );

          const descendantsI18nTitle = node.querySelectorAll('[i18n-title]');
          descendantsI18nTitle.forEach(el =>
            setTranslatedText(el, 'i18n-title', 'title')
          );

          // data-open-state persistence for details elements
          const openState = node.getAttribute('data-open-state');
          if (openState !== null) {
            const saved = localStorage.getItem(`data-open-state-${openState}`);
            if (saved !== null) node.open = saved === 'true';

            node.addEventListener('toggle', () => {
              localStorage.setItem(`data-open-state-${openState}`, node.open);
            });
          }

          // Also process descendants with data-open-state attribute
          const descendantsOpenState = node.querySelectorAll('[data-open-state]');
          descendantsOpenState.forEach(el => {
            const os = el.getAttribute('data-open-state');
            const saved = localStorage.getItem(`data-open-state-${os}`);
            if (saved !== null) el.open = saved === 'true';

            el.addEventListener('toggle', () => {
              localStorage.setItem(`data-open-state-${os}`, el.open);
            });
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('languagechange', ()=>{
      const elements = this.querySelectorAll('[i18n]');
      elements.forEach((el) => setTranslatedText(el,'i18n',"innerHTML"));
      const elements2 = this.querySelectorAll('[i18n-title]');
      elements2.forEach((el) => setTranslatedText(el,'i18n-title',"title"));
    });

    this.innerHTML = `
      <header>
        <sc-upload></sc-upload>
        <sc-mods></sc-mods>
        <div class="separator"></div>
        <sc-factions></sc-factions>
      </header>
      <section>
        <article>
          <sc-race></sc-race>
        </article>
        <article id="entity">
          <sc-unit></sc-unit>
          <sc-upgrade></sc-upgrade>
        </article>
      </section>
      <sc-language></sc-language>
      <a title="Join All Races Discord Server" target="_blank" class="btn-discord" href="https://discord.gg/8T4MUA3xXr"><span></span></a>
    `


    const tooltip = document.createElement('div');
    tooltip.className = "sc-tooltip"
    tooltip.innerHTML = ``
    this.appendChild(tooltip);

    const tooltipContent = document.createElement('div');
    tooltipContent.className = "sc-tooltip-content"
    tooltipContent.innerHTML = ``
    tooltip.appendChild(tooltipContent);

    // document.addEventListener('click', function(event) {
    //   const a = event.target.closest('a');
    //   if(a?.href.includes('unit=') || a?.href.includes('upgrade=')){
    //     document.getElementById('entity').scrollIntoView({ behavior: 'smooth' });
    //   }
    // });


    document.addEventListener('click', function(event) {
      const codeEl = event.target.closest('code');
      if (codeEl) {
        const text = codeEl.textContent;
        navigator.clipboard.writeText(text)
          .then(() => {
            // Show copied notification
            codeEl.classList.add('copied');

            // Remove 'copied' status after 1 second
            setTimeout(() => codeEl.classList.remove('copied'), 1000);
          })
          .catch(err => {
            console.error('Failed to copy:', err);
          });
      }
    });

    let target, previousTarget
    document.addEventListener('mouseover', (e) => {
      previousTarget = target;
      target = e.target.closest('[data-tooltip]');
      if (!target){
        if(previousTarget){
          tooltip.style.display = 'none';
        }
        return;
      }

      tooltipContent.innerHTML = target.querySelector(".tooltip-data").innerHTML
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';

      const rect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = rect.top - tooltipRect.height - 5;
      let left = rect.left + (rect.width - tooltipRect.width) / 2
      let className =  "sc-tooltip tooltip-top"

      // Adjust if near top
      if (rect.top < tooltipRect.height + 10) {
        top = rect.bottom + 5;
        className =  "sc-tooltip tooltip-bottom"
      }

      // Adjust if near left edge
      if (rect.left < tooltipRect.width / 2) {
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + 5;
        className =  "sc-tooltip tooltip-right"
      }

      // Adjust if near right edge
      if (viewportWidth - rect.right < tooltipRect.width / 2) {
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - 5;
        className =  "sc-tooltip tooltip-left"
      }

      // Adjust if near top and near bottom (show left or right)
      if (rect.top < tooltipRect.height + 10 && viewportHeight - rect.bottom < tooltipRect.height + 10) {
        if (rect.left > viewportWidth / 2) {
          // show left
          left = rect.left - tooltipRect.width - 5;
          top = rect.top + (rect.height - tooltipRect.height) / 2;
          className =  "sc-tooltip tooltip-left"
        } else {
          // show right
          left = rect.right + 5;
          top = rect.top + (rect.height - tooltipRect.height) / 2;
          className =  "sc-tooltip tooltip-right"
        }
      }

      tooltip.className = className
      tooltip.style.top = `${top + window.scrollY}px`;
      tooltip.style.left = `${left + window.scrollX}px`;
    });


    let setTranslatedText = (el,attribute,property) =>{
      const key = el.getAttribute(attribute);
      if(key.includes(":")){
        let [...all] = key.split(":")
        let field = all.pop();
        this.loadData(...all).then((objectData)=>{
          el[property] = objectData ? this.i18n(objectData[field]) : ''
        })
      }
      else{
        el[property] = this.i18n(key)
      }
    }

  }
  update(field, value,old) {
  }
}

customElements.define('sc-wiki', ScWiki);
