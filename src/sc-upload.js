import "./lib/jszip.js";
import {Core} from "./lib/data.js";
import * as THREE from './lib/three/three.js';
import { DDSLoader } from './lib/three/DDSLoader.js';

class DDSBatchRenderer {
  constructor(width, height) {
    try {
      this.width = width;
      this.height = height;

      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;

      this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true, alpha: true});
      this.renderer.setSize(width, height);
      this.renderer.setClearColor(0x000000, 0); // transparent background
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;

      this.camera = new THREE.OrthographicCamera(
        width / -2, width / 2,
        height / 2, height / -2,
        1, 1000
      );
      this.camera.position.z = 10;

      this.scene = new THREE.Scene();

      this.geometry = new THREE.PlaneGeometry(width, height);
      // Flip UV vertically once
      const uv = this.geometry.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setY(i, 1 - uv.getY(i));
      }
      uv.needsUpdate = true;

      this.material = new THREE.MeshBasicMaterial({transparent: true});
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.scene.add(this.mesh);

      this.loader = new DDSLoader();
    }catch(e){
      console.error(e)
    }
  }

  async loadAndRender(src) {
    // Load texture as Promise
    const texture = await new Promise((resolve, reject) => {
      this.loader.load(src, resolve, undefined, reject);
    });
    texture.colorSpace = THREE.SRGBColorSpace;

    // Update material texture
    this.material.map = texture;
    this.material.needsUpdate = true;

    // Render scene
    this.renderer.render(this.scene, this.camera);

    // Return a Blob or Image
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob);
      });
    });
  }
}
const ddsRenderer = new DDSBatchRenderer(76, 76);


class ScUpload extends Core {
  constructor() {
    super();
  }
  async  loadAndRenderDDS(src) {
    try {
      const blob = await ddsRenderer.loadAndRender(src);
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      img.onload = () => URL.revokeObjectURL(img.src);
      document.body.appendChild(img);
    } catch (e) {
      console.error('Failed to load/render DDS:', src, e);
    }
  }
  async  loadAndRenderPNG(src) {
    let camera, scene, renderer;
    const loader = new THREE.TextureLoader();

    loader.load(src, (texture) => {

        texture.colorSpace = THREE.SRGBColorSpace;

        const texWidth = texture.image.width;
        const texHeight = texture.image.height;

        const canvas = document.createElement('canvas');
        canvas.width = texWidth;
        canvas.height = texHeight;

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(texWidth, texHeight);
        renderer.setClearColor(0x000000, 0);

        // Important: Tell renderer output is sRGB
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        camera = new THREE.OrthographicCamera(
          texWidth / -2, texWidth / 2,
          texHeight / 2, texHeight / -2,
          1, 1000
        );
        camera.position.z = 10;

        scene = new THREE.Scene();

        const geometry = new THREE.PlaneGeometry(texWidth, texHeight);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        renderer.render(scene, camera);

        canvas.toBlob(blob => {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          img.title = "PNG Render"
          document.body.appendChild(img);
        });
      },
      undefined,
      (error) => {
        console.error('Texture load error:', error);
      }
    );
  }
  addImageByLink(url) {
  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Loaded Image';
  img.style.imageRendering = 'pixelated'; // optional, for pixel art style
    img.title = "PNG"
  document.body.appendChild(img);
}
  async  renderDDSFromZip(zip,path) {

    const file = zip.file(path);
    if (!file) {
      console.error("DDS file not found in zip");
      return;
    }

      const arrayBuffer = await file.async('arraybuffer');
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const blobUrl = URL.createObjectURL(blob);

      try {
        const blobRendered = await ddsRenderer.loadAndRender(blobUrl);

        const img = document.createElement('img');
        img.src = URL.createObjectURL(blobRendered);
        img.onload = () => URL.revokeObjectURL(img.src);
        document.body.appendChild(img);
      } catch (e) {
        console.error('Failed to render DDS from ZIP:', file.name, e);
      }

      URL.revokeObjectURL(blobUrl);

    }


  connectedCallback() {
    let png = 'https://star-mods.github.io/assets/icons/btn-ability-keiron-convergence.png'
    let dds = 'https://star-mods.github.io/assets/btn-ability-keiron-convergence.dds'
    let mpq = 'https://star-mods.github.io/assets/components/parser/mods2/EditorTest01.SC2Mod'
    let zip = 'https://star-mods.github.io/assets/components/parser/mods2/liberty.sc2mod.zip'
    // this.addImageByLink(png);
    // this.loadAndRenderPNG(png)
    // this.loadAndRenderDDS(dds);
    this.innerHTML = `<label><input type="file" id="modInput" accept=".zip" /></label>`

    document.getElementById("modInput").addEventListener("change", async  (event)=> {
      const file = event.target.files[0];
      if (!file) return;
      this.zipIt(file)
    });

  }
  async zipIt(file) {

    const zip = await JSZip.loadAsync(file);

    // List all files
    zip.forEach((relativePath, zipEntry) => {
      console.log("Found file:", relativePath);
    });



    function replaceProcessingInstructions(xmlText) {
      return xmlText.replace(/<\?token\s+([^?>]+)\?>/g, (_, attrs) => {
        // Convert pseudo-attributes to real XML attributes
        const attrPairs = attrs
          .trim()
          .split(/\s+/)
          .map(pair => {
            const [key, value] = pair.split('=');
            return `${key}=${value}`;
          })
          .join(' ');
        return `<token ${attrPairs} />`;
      });
    }

    // Prse XML
    const xmlTextOriginal = await zip.file("base.sc2data/gamedata/actordata.xml").async("text");

    if (xmlTextOriginal) {

      const xmlTextModified = replaceProcessingInstructions(xmlTextOriginal);
      const xmlDoc = new DOMParser().parseFromString(xmlTextModified, "application/xml");

      // Now you can access <token> as a normal tag
      const tokens = xmlDoc.querySelectorAll("token");
      tokens.forEach(t => {
        console.log(t.getAttribute("id"), t.getAttribute("type"));
      });

      console.log("Parsed XML:", xmlDoc);
    }

    // Get Image
    const imgFile = zip.file("logo-small.png"); // Adjust path
    if (imgFile) {
      const blob = await imgFile.async("blob");
      const url = URL.createObjectURL(blob);
      const imgElement = document.createElement("img");
      imgElement.src = url;
      document.body.appendChild(imgElement);
    }


    this.renderDDSFromZip(zip,"base.sc2assets/assets/textures/ai_avatar_loading.dds");



  }

}

customElements.define('sc-upload', ScUpload);
