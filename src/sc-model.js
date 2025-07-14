export const MODELS_BASE = 'https://star-assets.github.io/models-glb/';

import { Core } from "./lib/data.js";
import * as modelPlayer from "./lib/three/Player.js";
// import * as modelPlayer from "./lib/three/js-3d-model-viewer.js";

class ScModel extends Core {
  static get observedAttributes() {
    return ['mod', 'unit'];
  }

  constructor() {
    super();
    this.data = null;
    this.scene = null;
    this.viewerElement = null;
  }

  load () {
    this.innerHTML = `
      <div id="viewer" class="viewer-small">
        <div class="viewer-inner" id="viewer-inner">
          <div title="Fullscreen Preview" class="fullscreen-button" id="fullscreen">⛶</div>
          <div title="Fullscreen Preview" class="fullscreen-button" id="fullscreen-exit">✖</div>
        </div>
      </div>
    `;
    this.initScene();
    this.reload();
  }

  async reload() {
    if (!this.scene || !this.mod || !this.unit) {
      this.style.display = 'none'
      return
    }
    this.style.display = 'block'
    const data = await this.loadData(this.mod,'unit', this.unit);
    this.data = data;
    this.loadModel();
  }
   exitFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
  initScene() {
    // Даем DOM время на отрисовку
    // setTimeout(() => {
    this.viewerElement = this.querySelector('#viewer-inner');
    // const viewer = this.querySelector('#viewer');
    const fullscreenBtn = this.querySelector('#fullscreen');
    const fullscreenExitBtn = this.querySelector('#fullscreen-exit');
    if (!this.viewerElement || !fullscreenBtn) return;

    try{
      this.scene = modelPlayer.prepareScene(this.viewerElement, {
        width: 400,
        height: 250,
        background: '#3a4d63'
      });
      modelPlayer.resetCamera(this.scene);
    }
    catch(e){
      this.scene = null;
      this.style.display = 'none'
      return;
    }

    fullscreenBtn.addEventListener('click', () => {
      modelPlayer.goFullScreen(this.querySelector("#viewer-inner"));
    });
    fullscreenExitBtn.addEventListener('click', () => {
      this.exitFullScreen()
    });
    // }, 0);
  }

  loadModel() {
    if (!this.data) return;
    modelPlayer.clearScene(this.scene);
    modelPlayer.resetCamera(this.scene);

    const viewer = this.querySelector('#viewer');
    if (this.data.Model) {
      viewer.style.display = 'block';
      modelPlayer.loadGlb(this.scene, MODELS_BASE + this.data.Model + '.glb', () => {});
    } else {
      viewer.style.display = 'none';
    }
  }

  update(field, value, old) {
    this.reload();
  }
}

customElements.define('sc-model', ScModel);
