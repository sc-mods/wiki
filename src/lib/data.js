
import { loadData} from "./resolve.js";
import {i18n, setLang} from './lang.js';


export class StateManager {
  constructor() {
    this.data = {
      mods: {},
      factions: {},
      units: {},
    }
    this.state = {
      mod: null,
      category: null,
      faction: null,
      unit: null,
      upgrade: null,
    };

    this.listeners = new Set();
    window.addEventListener('popstate', () => this._syncFromURL());
    this._syncFromURL()
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notify(field, value,old) {
    for (const cb of this.listeners) {
      cb(field, value, old);
    }
  }

  async _syncFromURL() {
    const url = new URL(window.location.href);
    const params = url.searchParams;




    let field = 'category'
    let value = params.get(field) || 'melee';
    let old = this.state[field]
    if (value !== old) {
      this.state[field] = value
      this._notify(field, value, old);
    }
    for (let field of ['mod', 'faction', 'unit', 'upgrade']) {
      let value = params.get(field);
      let old = this.state[field]
      if (value !== old) {
        this.state[field] = value
        this._notify(field, value, old);
      }
    }
    let lang = params.get("lang");
    if(lang){
      setLang(lang)
      this._updateURL()
    }
  }

  _updateURL() {
    const params = new URLSearchParams();

    if (this.state.mod) params.set('mod', this.state.mod);
    if (this.state.faction) params.set('faction', this.state.faction);
    if (this.state.unit) params.set('unit', this.state.unit);
    if (this.state.upgrade) params.set('upgrade', this.state.upgrade);
    if (this.state.category && this.state.category !== 'melee') {
      params.set('category', this.state.category);
    }

    const newUrl = `?${params.toString()}`;
    history.pushState(null, '', newUrl);
  }

  async setState(partial) {
    for (let field in partial) {
      let old = this.state[field]
      let value = partial[field];
      if (value !== old) {
        this.state[field] = value
        this._notify(field, value, old);
      }
    }
  }

  getState() {
    return {...this.state};
  }

  linkClick(event) {
    const path = event.composedPath();
    for (const node of path) {
      if (node.tagName === 'A' && node.href ) {
        if(node.target === "_blank"){
          return;
        }
        event.preventDefault();
        const url = node.getAttribute('href');
        history.pushState(null, '', url);
        this._syncFromURL()
        break;
      }
    }
  }
}
let mgr = new StateManager()

export const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

export class Core extends HTMLElement {
  constructor() {
    super();
    this.mgr = mgr

    // Handle internal link navigation
    this.addEventListener('click', this.mgr.linkClick.bind(this.mgr));

    this._translate = this.translate.bind(this)
    this._update = this.updateState.bind(this)
    this.loadData = loadData
    this.i18n = i18n
    this._attr = {}

    this._parentModObserver = null;
    this._onParentAttrChange = this._onParentAttrChange.bind(this);
  }
  updateState(field,value, old ){
    if(this[field] !== value){
      this[field] = value
      this.update(field, value, old);
    }
  }
  connectedCallback() {
    window.addEventListener('languagechange', this._translate);
    this._unregister = this.mgr.onChange(this._update)
    this._parentWiki = this.closest('sc-wiki');
    if (this._parentWiki ) {
      this._observeParentAttr();
    }
    for(let observableAttribute of this.constructor.observedAttributes) {
      this[observableAttribute] = this.getEffectiveAttr(observableAttribute);
    }
    this.load();
  }
  disconnectedCallback() {
    window.removeEventListener('languagechange', this._translate);
    this._unregister()
    if (this._parentModObserver) {
      this._parentModObserver.disconnect();
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    for(let observableAttribute of this.constructor.observedAttributes){
      if (name === observableAttribute && oldValue !== newValue) {
        if (newValue !== null) {
          // If sc-list gets its own mod, stop watching parent
          if (this._parentModObserver) this._parentModObserver.disconnect();
        } else {
          // If mod attribute is removed, rewatch parent
          if (this._parentWiki) this._observeParentAttr();
        }
        this._applyEffectiveAttr(observableAttribute);
      }
    }
  }

  _observeParentAttr() {
    if (!this._parentWiki) return;
    if (this._parentModObserver) this._parentModObserver.disconnect();

    this._parentModObserver = new MutationObserver(this._onParentAttrChange);
    this._parentModObserver.observe(this._parentWiki, {
      attributes: true,
      attributeFilter: this.constructor.observedAttributes
    });
  }

  _onParentAttrChange() {
    for(let observableAttribute of this.constructor.observedAttributes){
      if (!this.hasAttribute(observableAttribute)) {
        this._applyEffectiveAttr(observableAttribute);
      }
    }
  }

  _applyEffectiveAttr(observableAttribute) {
    const val = this.getEffectiveAttr(observableAttribute);
    this[observableAttribute] = val;
    this.update(observableAttribute,val); // <-- you can implement this hook in your class
  }

  getEffectiveAttr(observableAttribute) {
    return this.getAttribute(observableAttribute) ??
      this._parentWiki?.getAttribute(observableAttribute) ??
      this.mgr.state[observableAttribute] ??
      null;
  }
  interpolate(text){
    return text.replace(/\{\{(\w+)}}/g, (_, key) => {
      return this.i18n(this.data?.[key] ?? key);
    });
  }
  load(){

  }
  update(attr, value){
    // Do your data loading or UI update here
  }
  translate(language){
    this.update("lang", language)
  }
}
