import {Core} from "./lib/data.js";

class ScUnit extends Core {
  static get observedAttributes() {
    return ['mod', 'unit'];
  }

  constructor() {
    super();
  }
  load() {
    this.render();
    this.reload();
  }
  reload() {
    this.style.display = "none"
    if (!this.mod || !this.unit) {
      return;
    }
    this.loadData(this.mod,"unit",  this.unit).then(data => {
      this.data = data
      this.updateFields()
      document.getElementById('entity').scrollIntoView({ behavior: 'smooth' });
    })
  }
  updateFields(){
    const u = this.data;

    if(!u){
      this.style.display = "none"
    }
    else{
      this.style.display = "flex"
    }



    const production = (u.$Production || []).filter(Boolean)
    const producers = (u.$Producers || []).filter(Boolean)
    const upgrades = (u.$Ugrades || []).filter(Boolean)
    const weapons = (u.$Weapons || []).filter(Boolean)
    const morph = (u.$Phase || []).filter(Boolean)
    let fields = this.fields().map(field => ({field,value: this.getValue(field)})).filter(o => o.value !== undefined);


    this.querySelector("[data-section=weapons]").style.display = weapons.length ? "block" : "none"
    this.querySelector("[data-section=model]").style.display = u.Model ? "block" : "none"
    this.querySelector("[data-section=production]").style.display = production.length ? "block" : "none"
    this.querySelector("[data-section=producers]").style.display =producers.length ? "block" : "none"
    this.querySelector("[data-section=morph]").style.display =morph.length ? "block" : "none"
    this.querySelector("[data-section=card]").style.display = u.CardLayouts?.Root ? "block" : "none"
    this.querySelector("[data-section=weapons]").style.display == u.Weapons?.length ? "block" : "none"
    this.querySelector("[data-section=upgrades]").style.display == upgrades.length ? "block" : "none"


    let key = `${this.mod}:unit:${u.id}`
    const lifeTemplate = (field,showArmor) => {
      let max = u[field + 'Max']
      if(!max){
        return ``;
      }
      let title = u[field + 'ArmorName']
      let icon = u[field + 'ArmorIcon']
      let armor = u[field + 'Armor']
      let start = u[field + 'Start']
      let regenRate = Math.round(u[field + 'RegenRate'],2)

      let vitalIcon = `<sc-icon icon="${icon}" class="short-icon unit-armor">${(armor || showArmor) ? `<span>${armor || "0"}</span>`: ''}</sc-icon>`
      if(field === "Energy"){
        vitalIcon = `<span class="resources-energy" i18n-title="energy"></span>`
      }

      return `
        <div class="unit-stat" i18n-title="${key}:${field + 'ArmorName'}">
            ${vitalIcon}
          <span class="unit-stat-value">
            ${start !== undefined && start !== max ? `${start}<span class="smaller"> / </span>`: ''}${max}
            ${regenRate ? `<sub class="smaller">+${regenRate}/s</sub>` : ''}
          </span>
        </div>`
    }

    if(weapons){
      this.querySelector("[data-section=weapons-list]").innerHTML = weapons.map(w =>  `<sc-weapon weapon="${w.id}"></sc-weapon>`).join("")
    }



    this.querySelector("[data-section=vitals]").innerHTML = `
        ${lifeTemplate("Life",true)}
        ${lifeTemplate("Shields",true)}
        ${lifeTemplate("Energy")}
    `

    this.querySelector("[data-section=icon]").innerHTML = `<sc-icon class="frame" icon="${u.Icon}" i18n-title="${key}:Name"></sc-icon>`
    this.querySelector("[data-section=title]").innerHTML = `<b i18n="${key}:Name"></b> <code i18n="${key}:id"></code>`
    this.querySelector("[data-section=description]").innerHTML = `<span i18n="${key}:Description"></span>`
    this.querySelector("[data-section=stats]").innerHTML = `<table>${fields.map(({field,value}) => `<tr><td>${field}: </td><td>${value}</td></tr>`).join('')} </table>`
    this.querySelector("[data-section=attributes]").innerHTML = `${(u.Attributes || []).map(attr => `<span class="sc-attribute" i18n="${attr}"></span>`).join(' ')}`
    this.querySelector("[data-section=cots]").innerHTML = `
        ${u.CostResource?.Minerals ? `
            <div class="unit-stat" i18n-title="Minerals"><span class="resources-minerals"></span><span class="unit-stat-value">${u.CostResource.Minerals}</span></div>` : ''}
        ${u.CostResource?.Vespene ? `
            <div class="unit-stat" i18n-title="Vespene"><span class="resources-vespene"></span><span class="unit-stat-value">${u.CostResource.Vespene}</span></div>` : ''}
        ${u.Food ? `
            <div class="unit-stat" i18n-title="Food"><span class="resources-supply"></span><span class="unit-stat-value">${u.Food}</span></div>` : ''}`


  }
  fields(){
    return Object.keys(this.data).sort((a,b)=> a> b? 1: -1).filter(f => {
      if (["Name","Description",
          "id",
          "CostResource",
          "Food",
          "CardLayouts",
          "Attributes",
          "Weapons",
          "Behaviors",
          "Abilities",
          "Icon",
          "Model",
          "FogVisibility",
          "ResourceState",
          "ResourceType",
          "Response",
          "ReviveInfoBase",
          "ReviveType",
          "DamageDealtXP",
          "DamageTakenXP",
          "DeathRevealDuration",
          "DeathRevealFilters",
          "DeathRevealRadius",
          "DeathRevealType",
          "DefaultAcquireLevel",
          "LeaderAlias",
          "Fidget",
          "Mass",
          "Mob",
          "TauntDuration",
          "HotkeyCategory",
          "EditorCategories",
          "ScoreResult",
          "GlossaryCategory",
          "CostCategory",
          "Race",
          "ArmorType",
          "PawnItemReduction",
          "AIEvalFactor",
          "EditorFlags",
          "InnerRadiusSafetyMultiplier",
          "TacticalAIFilters",
          "TacticalAI",
          "KillDisplay",
          "AIEvaluateAlias",
          "PawnItemReduction",
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
    if(field === "FlagArray"){
      value = JSON.stringify(this.data[field].filter(f =>  ![
        "Movable","Unclickable","Unhighlightable","Untooltipable","KillCredit","ShowResources","ClearRallyOnTargetLost",
        "PlayerRevivable","CameraFollow","PreventDestroy","UseLineOfSight",
        "TownAlert","NoPortraitTalk","TownCamera","ArmorDisabledWhileConstructing",
        "AIThreatGround","AIThreatAir","AISupport"
      ].includes(f)))
    }
    value = value.replace(/"/g,'')


    if(['"',"["].includes(value[0])){
      value=value.substring(1,value.length - 1)
    }
    return  value
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
            <div class="unit-stats">
              <p data-section="attributes"></p>
            </div>
            <div class="unit-short-stats unit-stats" data-section="vitals">
            </div>
          </div>
        </div>
        <details data-section="model" open data-open-state="model">
          <summary><p class="sc-unit-category" i18n="model"></p></summary>
          <div class="sc-model-cotainer">
          </div>
        </details>
         <details open data-open-state="stats">
          <summary> <p class="sc-unit-category" i18n="stats"></p></summary>
          <div class="table-container" data-section="stats">
          </div>
        </details>

        <details data-section="weapons" open data-open-state="weapons">
          <summary><p class="sc-unit-category" i18n="weapon-stats"></p></summary>
          <div data-section="weapons-list" class="weapons-list"></div>
        </details>
        <details  data-section="card" open data-open-state="card">
          <summary><p class="sc-unit-category" i18n="command-card"></p></summary>
          <div class="card-list">
            <sc-card></sc-card>
            <sc-button></sc-button>
          </div>
        </details>
        <details data-section="upgrades" open data-open-state="upgrades">
          <summary><p class="sc-unit-category" i18n="upgrades"></p></summary>
            <sc-list source="unit" category="upgrades"></sc-list>
        </details>
        <details data-section="production" open data-open-state="production">
          <summary><p class="sc-unit-category" i18n="production"></p></summary>
            <sc-list source="unit" category="production"></sc-list>
        </details>
        <details data-section="producers" open data-open-state="manufacturer">
          <summary><p class="sc-unit-category" i18n="manufacturer"></p></summary>
            <sc-list source="unit" category="producers"></sc-list>
        </details>
        <details data-section="morph" open data-open-state="morph">
          <summary><p class="sc-unit-category" i18n="morphs"></p></summary>
            <sc-list source="unit" category="morph"></sc-list>
        </details>
      </div>`


    // Add event listener after render
      const details = this.querySelector('details[data-section="model"]');
      const container = this.querySelector('.sc-model-cotainer');

      if(details && container) {
        details.addEventListener('toggle', () => {
          if(details.open) {
            // Add the sc-model element if missing
            if (!container.querySelector('sc-model')) {
              const scModel = document.createElement('sc-model');
              container.appendChild(scModel);
            }
          } else {
            // Clear the container content when closed
            container.innerHTML = '';
          }
        });
      }
      if(details.open) {
        // Add the sc-model element if missing
        if (!container.querySelector('sc-model')) {
          const scModel = document.createElement('sc-model');
          container.appendChild(scModel);
        }
      } else {
        // Clear the container content when closed
        container.innerHTML = '';
      }
    }

  update(field, value, old) {
    if (["mod","unit"].includes(field) ) {
      this.load()
    }
  }
}

customElements.define('sc-unit', ScUnit);
