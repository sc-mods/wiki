import {Core} from "./data.js";

class ScUpgrade extends Core {
  static get observedAttributes() {
    return ['mod', 'upgrade'];
  }
  load() {
    this.render();
    this.reload();
  }
  reload() {
    if (!this.mod || !this.upgrade) {
      this.style.display = "none"
      return;
    }
    this.loadData(this.mod,"upgrade",  this.upgrade).then(data => {
      this.data = data
      this.updateFields()
    })
  }

  fields(){
    return Object.keys(this.data).sort((a,b)=> a> b? 1: -1).filter(f => {
      if (["Name","Description",
          "id",
          "class",
        ].includes(f) ||
        f.startsWith("$") ||
        f.startsWith("Life") ||
        f.startsWith("Shield") ||
        f.startsWith("Energy")) {
        return false
      }
      return true
    })
  }
  getValue( field){
    let value  = JSON.stringify(this.data[field]) || ''
    value = value.replace(/"/g,'')
    if(['"',"["].includes(value[0])){
      value=value.substring(1,value.length - 1)
    }
    return  value
  }
  updateFields(){
    const u = this.data;

    if(!u){
      this.style.display = "none"
    }
    else{
      this.style.display = "flex"
    }
    let key = `${this.mod}:upgrade:${u.id}`
    let fields = this.fields().map(field => ({field,value: this.getValue(field)})).filter(o => o.value !== undefined);

    this.querySelector("[data-section=icon]").innerHTML = `<sc-icon class="frame" icon="${u.Icon}" i18n-title="${key}:Name"></sc-icon>`
    this.querySelector("[data-section=title]").innerHTML = `<b i18n="${key}:Name"></b> <code i18n="${key}:id"></code>`
    this.querySelector("[data-section=description]").innerHTML = `${this.i18n(u.Description)}`
    this.querySelector("[data-section=stats]").innerHTML = `<table>${fields.map(({field,value}) => `<tr><td>${field}: </td><td>${value}</td></tr>`).join('')} </table>`
  }
  render() {
    this.innerHTML = `
      <h3 data-section="title"></h3>
      <div class="sc-unit-details-content">
        <div class="unit-main-info-container">
          <div class="unit-main-info">
            <div data-section="icon"></div>
            <div class="unit-short-stats unit-costs" data-section="cots"></div>
          </div>
          <div class="unit-stats-info">
            <p class="unit-description" data-section="description"></p>
          </div>
        </div>
       <details open data-open-state="upgrade-stats">
          <summary> <p class="sc-unit-category" i18n="stats"></p></summary>
          <div class="table-container" data-section="stats">
          </div>
        </details>
      </div>`
  }

  update(field, value, old) {
    this.reload();
  }
}

customElements.define('sc-upgrade', ScUpgrade);
