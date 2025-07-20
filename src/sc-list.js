import {Core} from './data.js';

class ScList extends Core {
  static get observedAttributes() {
    return ['mod', 'unit','upgrade','faction', 'category','source'];
  }

  constructor() {
    super();
    this._unitLinks = new Map();
  }

  load() {
    this._unitLinks.clear();
    this.textContent = '';
    if (!this.mod) {return;}
    if(!this.source)this.source = "faction"

    switch(this.source){
      case "faction":
        if (!this.faction) {return;}
        this.loadData(this.mod, "faction",  this.faction).then(data => {
          this.list = data[this.category];
          this.selectedparamName = this.category === "upgrades" ? "upgrade" : "unit";
          this.datasource = data.cache[this.category === "upgrades" ? "upgrades" : "units"];
          this._buildList();
        })
        .catch(() => {
        });
        break;
      case "unit":
        if (!this.unit) {return;}
        this.loadData(this.mod,"unit",  this.unit).then(data => {
          this.loadData(this.mod, "faction",  this.faction).then(factionData => {
            let categories = {
              upgrades: "$Upgrades",
              production: "$Production",
              producers: "$Producers",
              morph: "$Phase"
            }
            this.list = data[categories[this.category]];
            let parameterNames = {
              upgrades: "upgrade"
            }
            this.selectedparamName = parameterNames[this.category] || "unit"
            this.datasource = factionData.cache[this.category === "upgrades" ? "upgrades" : "units"];
            this._buildList();
          })
        })
        .catch(() => {
        });
    }
  }

  _buildList() {
    this._unitLinks.clear();
    this.textContent = '';

    // this.titleEl = document.createElement('h4');
    // this.titleEl.textContent = this.i18n(this.category + '-title');
    // this.appendChild(this.titleEl);

    const ul = document.createElement('ul');
    ul.classList.add('units-list');
    this.appendChild(ul);

    const paramName = this.category === "upgrades" ? "upgrade" : "unit";

    this.list?.forEach(uid => {
      const unit = this.datasource[uid];
      if (!unit) return;
      if(unit.$Phased)return;
      let key = `${this.mod}:${paramName}:${unit.id}`

      const li = document.createElement('li');
      const a = document.createElement('a');

      a.href = `?mod=${this.mod}&faction=${this.faction}&${paramName}=${unit.id}`;
      if (unit.id === this[this.selectedparamName]) {
        a.classList.add('selected');
      }
      a.setAttribute("data-tooltip","true");

      // unit.$Phase?.length && console.log(unit.$Phase) c
      const templateTooltip = document.createElement('div');
      templateTooltip.className = 'tooltip-data'
      templateTooltip.innerHTML =  `
        <h3><b i18n="${key}:Name"></b></h3>
        <div class="sc-unit-details-content"><p i18n="${key}:Description"></p></div>`
      a.appendChild(templateTooltip);


      const icon = document.createElement('sc-icon');
      icon.setAttribute('icon', unit.Icon);
      icon.setAttribute('alt', this.i18n(unit.Name));
      a.appendChild(icon);

      li.appendChild(a);

      if(unit.$Phase?.length){

        let ulp = document.createElement('ul');
        ulp.className = 'phase-units'
        for(let phasedUnit of unit.$Phase){
          const unit = this.datasource[phasedUnit];
          let key = `${this.mod}:${paramName}:${unit.id}`
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `?mod=${this.mod}&faction=${this.faction}&${paramName}=${unit.id}`;
          if (unit.id === this[this.selectedparamName]) {
            a.classList.add('selected');
          }
          a.setAttribute("data-tooltip","true");
          li.appendChild(a);
          const templateTooltip = document.createElement('div');
          templateTooltip.className = 'tooltip-data'
          templateTooltip.innerHTML =  `
            <h3><b i18n="${key}:Name"></b></h3>
            <div class="sc-unit-details-content"><p i18n="${key}:Description"></p></div>`
          a.appendChild(templateTooltip);
          
          const icon = document.createElement('sc-icon');
          icon.setAttribute('icon', unit.Icon);
          icon.setAttribute('alt', this.i18n(unit.Name));
          a.appendChild(icon);
          ulp.appendChild(li);
        }
        li.appendChild(ulp);
      }

      ul.appendChild(li);

      this._unitLinks.set(unit.id, a);
    });
  }

  updateSelected(newSelected, oldSelected) {
    if (oldSelected && this._unitLinks.has(oldSelected)) {
      this._unitLinks.get(oldSelected).classList.remove('selected');
    }
    if (newSelected && this._unitLinks.has(newSelected)) {
      this._unitLinks.get(newSelected).classList.add('selected');
    }
  }

  update(field, value,old) {
    if (field === 'lang') {
      // Translate title
      // if (this.titleEl) {
      //   this.titleEl.textContent = this.i18n(this.category + '-title');
      // }

      // Update icons' alt texts
      for (const [uid, a] of this._unitLinks.entries()) {
        const unit = this.datasource[uid];
        if (!unit) continue;
        const icon = a.querySelector('sc-icon');
        if (icon) {
          icon.setAttribute('alt', this.i18n(unit.Name));
        }
      }
    }

    if (["faction","mod","source"].includes(field) ) {
      this.load()
    }
    if (this.source === "unit" && ["unit"].includes(field) ) {
      this.load()
    }
    if (field === this.selectedparamName) {
      this.updateSelected(value, old);
    }
  }
}

customElements.define('sc-list', ScList);
