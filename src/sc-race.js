import {Core} from "./lib/data.js";

class ScRace extends Core {
  static get observedAttributes() {
    return ['mod', 'faction'];
  }

  load() {
    this.textContent = '';
    if (!this.mod || !this.faction) {
      return;
    }
    this.loadData(this.mod,"faction",  this.faction).then(data => {
      this.data = data
      this.render();
    })
  }
  render() {
    const u = this.data;
    if (!u) return;

    let key = `${this.mod}:faction:${u.id}`
    this.innerHTML = this.interpolate(`
      <h3><b i18n="${key}:Name"></b> <code i18n="${key}:id"></code></h3>
      <div class="sc-unit-details-content">


        <details data-section="model" open data-open-state="army">
          <summary><p class="sc-unit-category" i18n="army"></p></summary>
          <sc-list category="army"></sc-list>
        </details>

        <details data-section="model" open data-open-state="structures">
          <summary><p class="sc-unit-category" i18n="structures"></p></summary>
          <sc-list category="structures"></sc-list>
        </details>

        <details data-section="model" open data-open-state="upgrades">
          <summary><p class="sc-unit-category" i18n="upgrades"></p></summary>
          <sc-list category="upgrades"></sc-list>
        </details>
      </div>

    `, u);
    }

  update(field, value, old) {
    if (["faction","mod"].includes(field) ) {
      this.load()
    }
  }
}

customElements.define('sc-race', ScRace);
