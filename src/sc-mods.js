
import {Core, isTouchDevice} from "./data.js";

class ScMods extends Core {
  static get observedAttributes() {
    return ['mod','unit','upgrade','faction','category'];
  }

  constructor() {
    super();
    this._modLinks = new Map();
    this._selected = null;
    this._mods = [];
  }
  load() {
    this.loadData("$",this.category).then(data => {
        this._mods = data.mods
        this._buildList();
        if (this.mod) {
          this.update("mod",this.mod);
        }
      });
  }
  _buildList() {
    this._modLinks.clear();
    this.textContent = '';

    this.titleEl = document.createElement('h4');
    this.titleEl.textContent = this.i18n('select-mod');
    this.appendChild(this.titleEl);

    const ul = document.createElement('ul');
    ul.classList.add('mod-list');
    this.appendChild(ul);

    const unit = this.unit
    const upgrade = this.upgrade
    const faction = this.faction

    this._mods.forEach(mod => {
      const li = document.createElement('li');
      const a = document.createElement('a');

      const params = new URLSearchParams({ mod: mod.id });
      // if (unit) params.set('unit', unit);
      // if (upgrade) params.set('upgrade', upgrade);
      // if (faction) params.set('faction', faction);

      a.href = `?${params.toString()}`;
      const iconEl = document.createElement('sc-icon');
      iconEl.setAttribute('icon', mod.icon || 'mod-'  + mod.id.toLowerCase() );
      iconEl.setAttribute('alt', this.i18n(mod.name));
      a.appendChild(iconEl);

      li.appendChild(a);

      // Add dropdown for versions
      if (mod.versions && Array.isArray(mod.versions)) {
        const dropdownBtn = document.createElement('button');
        dropdownBtn.textContent = '▼';
        dropdownBtn.classList.add('version-dropdown-toggle');
        dropdownBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          dropdownBtn.classList.toggle('toggled');
          versionList.classList.toggle('visible');
        });

        if (!isTouchDevice) {
          dropdownBtn.style.display = 'none'
        }

        const versionList = document.createElement('ul');
        versionList.classList.add('version-list');

        mod.versions.forEach(version => {
          const versionLi = document.createElement('li');
          const versionLink = document.createElement('a');
          const versionParams = new URLSearchParams({ mod: version.id });

          const iconEl = document.createElement('sc-icon');
          iconEl.setAttribute('icon', version.icon || 'mod-' + version.id.toLowerCase());
          iconEl.setAttribute('alt', this.i18n(version.name));
          versionLink.appendChild(iconEl);

          const versionSpan = document.createElement('span');
          versionSpan.classList.add('version-span');
          versionLink.appendChild(versionSpan);

          if (unit) versionParams.set('unit', unit);
          if (upgrade) versionParams.set('upgrade', upgrade);
          if (faction) versionParams.set('faction', faction);

          versionLink.href = `?${versionParams.toString()}`;
          versionLink.dataset.modid = version.id;

          versionSpan.textContent = this.i18n(version.name);
          versionLi.appendChild(versionLink);
          versionList.appendChild(versionLi);
        });


        a._versionList = versionList;


        li.appendChild(dropdownBtn);
        li.appendChild(versionList);
      }

      ul.appendChild(li);
      this._modLinks.set(mod.id, a);
    });
  }

  _buildURLs() {
    const unit =  this.unit
    const upgrade =  this.upgrade
    const faction =  this.faction

    // Update main mod links
    for (const [modId, a] of this._modLinks.entries()) {
      const params = new URLSearchParams({ mod: modId });
      if (unit) params.set('unit', unit);
      if (upgrade) params.set('upgrade', upgrade);
      if (faction) params.set('faction', faction);
      a.href = `?${params.toString()}`;

      // Handle version dropdown if exists
      const versionList = a._versionList;
      if (versionList) {
        for (const li of versionList.children) {
          const versionLink = li.querySelector('a');
          if (!versionLink || !versionLink.dataset.modid) continue;

          const versionModId = versionLink.dataset.modid;
          const versionParams = new URLSearchParams({ mod: versionModId });
          if (unit) versionParams.set('unit', unit);
          if (upgrade) versionParams.set('upgrade', upgrade);
          if (faction) versionParams.set('faction', faction);
          versionLink.href = `?${versionParams.toString()}`;
        }
      }
    }
  }
  update(field, value) {
    if (field === "lang") {
      // Translate title
      this.titleEl.textContent = this.i18n('select-mod');

      // Translate mod names and versions
      for (const [modId, a] of this._modLinks.entries()) {
        const mod = this._mods.find(m => m.id === modId);
        if (!mod) continue;

        // Update icon alt text
        const icon = a.querySelector('sc-icon');
        if (icon) icon.setAttribute('alt', this.i18n(mod.name));

        // If version label is shown, update it
        const span = a.querySelector('.version-span');
        if (span && mod.versions) {
          const selectedVersion = mod.versions.find(v =>
            span.textContent === this.i18n(v.name, value) // optional param for preview
          );
          if (selectedVersion) {
            span.textContent = this.i18n(selectedVersion.name);
          }
        }

        // Update version list if exists
        const versionList = a._versionList;
        if (versionList) {
          const versions = mod.versions || [];
          const versionSpans = versionList.querySelectorAll('.version-span');
          versionSpans.forEach((vs, i) => {
            vs.textContent = this.i18n(versions[i]?.name);
          });
        }
      }
      return;
    }

    if (["unit","upgrade","faction"].includes(field) ) {
      this._buildURLs()
    }
    if (field === "mod") {
      // Clear all selections and version labels
      for (const [modId, a] of this._modLinks.entries()) {
        a.classList.remove('selected');
        a.querySelector('.version-span')?.remove();

        a._versionList?.querySelectorAll('a').forEach(vLink => {
          vLink.classList.remove('selected');
        });
      }

      let versionMatched = false;
      let parentMod = null;
      let versionLabel = null;

      for (const mod of this._mods) {

        if (mod.versions) {
          const match = mod.versions.find(v => v.id === value);
          if (match) {
            versionMatched = true;
            parentMod = mod;
            versionLabel = this.i18n(match.name);
            break;
          }
        }
        else{

          if (mod.id === value) {
            const a = this._modLinks.get(mod.id);
            if (a) a.classList.add('selected');
            return;
          }
        }
      }

      if (versionMatched && parentMod && this._modLinks.has(parentMod.id)) {
        const parentLink = this._modLinks.get(parentMod.id);
        parentLink.classList.add('selected');

        if (parentMod.id !== value) {
          const span = document.createElement('span');
          span.className = 'version-span';
          span.textContent = versionLabel;
          parentLink.appendChild(span);
        }

        // ✅ Mark version link as selected
        const versionList = parentLink._versionList;
        if (versionList) {
          for (const li of versionList.children) {
            const vLink = li.querySelector('a');
            if (vLink && new URL(vLink.href).searchParams.get('mod') === value) {
              vLink.classList.add('selected');
              break;
            }
          }
        }
      }
    }
  }

}

customElements.define('sc-mods', ScMods);
