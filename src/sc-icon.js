export const ICON_BASE = 'https://star-mods.github.io/assets/icons/';

class SCIcon extends HTMLElement {
  static get observedAttributes() {
    return ['icon', 'alt'];
  }

  constructor() {
    super();
    this._img = document.createElement('img');
    this._img.classList.add('icon-img');
    this._img.style.opacity = '0';
  }

  connectedCallback() {
    if (!this.contains(this._img)) {
      this.appendChild(this._img);
    }
    this.updateSrc();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ((name === 'icon' || name === 'alt') && oldValue !== newValue) {
      this.updateSrc();
    }
  }

  updateSrc() {
    const file = this.getAttribute('icon');
    const alt = this.getAttribute('alt');
    if (!file || file === "undefined") return;

    this._img.style.opacity = '0';
    const src = ICON_BASE + file + '.png';

    const tempImg = new Image();
    tempImg.onload = () => {
      this._img.src = src;
      this._img.style.opacity = '1';
    };
    tempImg.onerror = () => {
      // Optional: set fallback icon
      this._img.src = ICON_BASE + 'fallback.png';
      this._img.style.opacity = '1';
    };
    tempImg.src = src;
  }
}

customElements.define('sc-icon', SCIcon);
