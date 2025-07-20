import { Core } from "./data.js";
import "./../lib/canvas-attribute-model-src/canvas-attribute-model-src.js";

export const MODELS_BASE = 'https://star-assets.github.io/models-glb/';

class ScModel extends Core {
  static get observedAttributes() {
    return ['mod', 'unit'];
  }

  constructor() {
    super();
    this.data = null;
    this.canvas = null;
  }

  load() {
    this.innerHTML = `
      <div id="viewer" class="viewer-small">
        <div class="viewer-inner" id="viewer-inner">
          <canvas id="model-canvas" auto-rotate mouse-rotate></canvas>
          <div title="Fullscreen Preview" class="fullscreen-button" id="fullscreen">⛶</div>
          <div title="Exit Fullscreen" class="fullscreen-button" id="fullscreen-exit">✖</div>
        </div>
      </div>
    `;
    this.initCanvasControls();
    this.reload();
  }

  async reload() {
    if (!this.mod || !this.unit) {
      this.style.display = 'none';
      return;
    }
    this.style.display = 'block';
    const data = await this.loadData(this.mod, 'unit', this.unit);
    this.data = data;
    this.loadModel();
  }

  exitFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  initCanvasControls() {
    this.container = this.querySelector('#viewer-inner')
    this.canvas = this.querySelector('#model-canvas');

    this.canvas.addEventListener('mouseenter', () => {
        this.canvas.setAttribute('auto-rotate-paused', 'true');
    });

    this.canvas.addEventListener('mouseleave', () => {
        this.canvas.removeAttribute('auto-rotate-paused');
    });

    const fullscreenBtn = this.querySelector('#fullscreen');
    const fullscreenExitBtn = this.querySelector('#fullscreen-exit');

    fullscreenBtn?.addEventListener('click', () => {
      this.container?.requestFullscreen();
    });

    fullscreenExitBtn?.addEventListener('click', () => {
      this.exitFullScreen();
    })
  }
  loadModel() {
    if (!this.data || !this.canvas) return;

    const modelUrl = this.data.Model ? MODELS_BASE + this.data.Model + '.glb' : null;
    if (!modelUrl) {
      this.querySelector('#viewer').style.display = 'none';
      return;
    }

    // Remove and re-append canvas to trigger MutationObserver if needed
    const canvas = this.canvas;
    // setTimeout(() => {
      canvas.setAttribute('model-src', modelUrl);
    // }, 0);
  }


  update(field, value, old) {
    this.reload();
  }
}

customElements.define('sc-model', ScModel);
