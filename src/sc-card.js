import { Core } from './data.js';

class ScCard extends Core {
  static get observedAttributes() {
    return ['mod', 'unit', 'card'];
  }

  constructor() {
    super();
    this.cards = {};
    this.activeCard = 'Root';
  }

  update(field, value, old) {
    if (["mod","unit", 'card'].includes(field) ) {
      this.load();
    }
    if ([ 'button'].includes(field) ) {
      this.updateSelected();
    }
  }

  load() {
    this.textContent = '';
    if (!this.mod || !this.unit) return;
    this.loadData(this.mod,"unit",  this.unit).then(data => {
      this.data = data;
      this.updateCard();
      this.render();
    });
  }
  updateCard(){
    let cards = {}
    if(this.data.CardLayouts){
      let notEmpty = false
      for(let cardID in this.data.CardLayouts){
        let layoutButtons = this.data.CardLayouts[cardID]

        let layout = [
          [[],[],[],[],[]],
          [[],[],[],[],[]],
          [[],[],[],[],[]]
        ]
        for(let layoutButton of layoutButtons) {
          let row = layoutButton.Row || 0
          let column = layoutButton.Column || 0
          if(row < 3 && column < 5){
            // @ts-ignore
            layout[row][column].push(layoutButton)
            notEmpty = true
          }
        }
        if(notEmpty){
          cards[cardID] = layout
        }
      }
    }

    this.cards = cards
  }
  targetFilters(filter) {
    return filter ? filter.replace(/,(Dead|Hidden|Invulnerable)/g, '') : ""
  }
  isInteractive(slot) {
    const btn = slot[0];
    return !!btn && (btn.Type === 'CancelSubmenu' || btn.Type === 'Submenu' || slot.length > 1);
  }
  switchIcon(slot, td) {
    if (slot.length <= 1) return;

    // Initialize visible index property if not present
    if (typeof slot._visibleIndex !== 'number') {
      slot._visibleIndex = 0;
    } else {
      // Increment and cycle
      slot._visibleIndex++;
      if (slot._visibleIndex >= slot.length) {
        slot._visibleIndex = 0;
      }
    }

    const visibleIndex = slot._visibleIndex;

    // Get all wrappers (each button's div container)
    const wrappers = Array.from(td.querySelectorAll(':scope > div'));

    wrappers.forEach((wrapper, i) => {
      wrapper.style.display = i === visibleIndex ? '' : 'none';
    });

    // Update submenu/cancel arrows
    const btn = slot[visibleIndex];

    // Remove existing arrows
    wrappers.forEach(wrapper => {
      wrapper.querySelectorAll('.card-more').forEach(el => el.remove());
    });

    if (btn.Type === 'Submenu' || btn.Type === 'CancelSubmenu') {
      const arrow = document.createElement('span');
      arrow.className = 'card-more';
      arrow.textContent = btn.Type === 'Submenu' ? '↪' : '↩';
      wrappers[visibleIndex].appendChild(arrow);
    }
  }
  updateSelected(){
    this.querySelectorAll(`[data-button]`).forEach(w => w.classList.remove("selected"))
    if(this.button){
      this.querySelector(`[data-button=${this.button}]`)?.classList.add("selected")
    }
  }

  render() {
    this.innerHTML = '';
    const layout = this.cards[this.activeCard];
    if (!layout) return;

    this.innerHTML = `
        <h3><b>${this.activeCard}</b></h3>
    `




    const container = document.createElement('div');
    container.classList.add('cards-container');

    const table = document.createElement('table');
    table.classList.add('cards');

    for (const row of layout) {
      const tr = document.createElement('tr');
      for (const cell of row) {
        const td = document.createElement('td');
        td.classList.add('card-slot');
        if (!cell[0]) td.classList.add('disabled');
        if (this.isInteractive(cell)) td.classList.add('interactive');


        if (cell.length) {
          td.classList.add('interactive');
          for (let i = 0; i < cell.length; i++) {
            const btn = cell[i];

            const icon = document.createElement('sc-icon');
            icon.setAttribute('icon', btn.Icon);
            icon.classList.add('card');

            const hotkey = document.createElement('span');
            hotkey.className = 'card-hotkey';
            hotkey.textContent = this.i18n(btn.Hotkey);

            const wrapper = document.createElement('div');
            wrapper.append(hotkey, icon);
            wrapper.classList.add("button-placeholder")
            wrapper.style.display = i === 0 ? '' : 'none'; // show only active
            wrapper.setAttribute("data-button", btn.id);
            wrapper.setAttribute("data-tooltip", "true");
            wrapper.addEventListener("click",()=>{
              this.mgr.setState({"button":btn.id})
            })

            let key = `${this.mod}:button:${btn.id}`;

            const templateTooltip = document.createElement('div');
            templateTooltip.className = 'tooltip-data';
            templateTooltip.innerHTML = `
              <h3><b i18n="${key}:Name"></b></h3>
              <div class="sc-unit-details-content">
                <div i18n="${key}:Tooltip"></div>
                <span class="unit-cost">
                  <span style="display:${btn.Cost?.Minerals ? "block" : "none"}" class="resources-minerals">${btn.Cost?.Minerals}</span>
                  <span style="display:${btn.Cost?.Vespene ? "block" : "none"}" class="resources-vespene">${btn.Cost?.Vespene}</span>
                  <span style="display:${btn.Cost?.Energy ? "block" : "none"}" class="resources-energy">${btn.Cost?.Energy}</span>
                  <span style="display:${btn.Cost?.Life ? "block" : "none"}" class="resources-life">${btn.Cost?.Life}</span>
                  <span style="display:${btn.Cost?.Shields ? "block" : "none"}" class="resources-shields">${btn.Cost?.Shields}</span>
                  <span style="display:${btn.Cost?.Food ? "block" : "none"}" class="resources-supply">${btn.Cost?.Food}</span>
                  <span style="display:${btn.Time ? "block" : "none"}" class="resources-time">${btn.Time}</span>
                </span>
                <div style="display:${btn.Info?.Cost?.[0]?.Cooldown?.TimeUse ? "block" : "none"}">Cooldown: ${btn.Info?.Cost?.[0]?.Cooldown?.TimeUse}</div>
                <div style="display:${btn.Info?.Range ? "block" : "none"}">Range: ${btn.Info?.Range}</div>
                <div style="display:${btn.Info?.TargetFilters ? "block" : "none"}">Targets: ${this.targetFilters(btn.Info?.TargetFilters?.[0])}</div>
              </div>
            `;
            wrapper.appendChild(templateTooltip);

            // handle submenu/cancel arrows only for active
            if (i === cell.length - 1) {
              if (btn.Type === 'Submenu') {
                const arrow = document.createElement('span');
                arrow.className = 'card-more';
                arrow.textContent = '↪';
                wrapper.appendChild(arrow);

                arrow.addEventListener('click', (e) => {
                  e.stopPropagation();
                  this.activeCard = btn.SubmenuCardId;
                    this.render();
                });


              } else if (btn.Type === 'CancelSubmenu') {
                const arrow = document.createElement('span');
                arrow.className = 'card-more';
                arrow.textContent = '↩';
                wrapper.appendChild(arrow);

                arrow.addEventListener('click', (e) => {
                  e.stopPropagation();
                  this.activeCard = 'Root';
                  this.render();
                });

              }
            }


            td.appendChild(wrapper);
          }

          if (cell.length > 1) {
            const alt = document.createElement('span');
            alt.className = 'card-more';
            alt.textContent = '↺';
            alt.addEventListener('click', (e) => {
              e.stopPropagation();
              this.switchIcon(cell, td);
            });
            td.appendChild(alt);
          }
        }




        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    container.appendChild(table);
    this.appendChild(container);
    this.updateSelected()
  }
}

customElements.define('sc-card', ScCard);
