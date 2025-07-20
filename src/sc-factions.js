import { Core } from "./data.js";

class ScFactions extends Core {
  static get observedAttributes() {
    return ['mod', 'faction'];
  }

  constructor() {
    super();
    this._factionLinks = new Map();
    this._factions = [];
  }

  load() {
    if (!this.mod) {
      this._factions = [];
      this.textContent = '';
      return;
    }

    this.loadData(this.mod).then(data => {
      this._factions = data.races || [];
      this._buildList();
    });
  }

  _buildList() {
    this._factionLinks.clear();
    this.textContent = '';

    this.titleEl = document.createElement('h4');
    this.titleEl.textContent = this.i18n('factions-title');
    this.appendChild(this.titleEl);

    const ul = document.createElement('ul');
    ul.classList.add("faction-list");
    this.appendChild(ul);

    const faction = this.faction
    const mod = this.mod

    this._factions.forEach(f => {
      const li = document.createElement('li');
      const a = document.createElement('a');

      const params = new URLSearchParams({ mod, faction: f.id });
      a.href = `?${params.toString()}`;

      const icon = document.createElement('sc-icon');
      icon.setAttribute('icon', f.Icon || `lobby-${f.id.toLowerCase()}`);
      icon.setAttribute('alt', this.i18n(f.Name));
      a.appendChild(icon);

      if (f.id === faction) {
        a.classList.add("selected");
      }

      li.appendChild(a);
      ul.appendChild(li);

      this._factionLinks.set(f.id, a);
    });
  }

  update(field, value) {
    if (field === "lang") {
      if (this.titleEl) {
        this.titleEl.textContent = this.i18n('factions-title');
      }

      for (const [id, a] of this._factionLinks.entries()) {
        const faction = this._factions.find(f => f.id === id);
        const icon = a.querySelector('sc-icon');
        if (icon && faction) {
          icon.setAttribute('alt', this.i18n(faction.Name));
        }
      }

      return;
    }
    if (field === "mod") {
      this.load();
    }

    if (field === "faction") {
      for (const [id, a] of this._factionLinks.entries()) {
        a.classList.toggle("selected", id === value);
      }
    }
  }
}

customElements.define('sc-factions', ScFactions);
