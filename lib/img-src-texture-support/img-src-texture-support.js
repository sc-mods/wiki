
import * as THREE from '../three/three.js';
// import { DDSLoader } from '../three/DDSLoader.js';
// import { KTX2Loader } from './three/KTX2Loader.js';
// import { TGALoader } from './three/TGALoader.js';
// import { RGBELoader } from './three/RGBELoader.js';
// import { EXRLoader } from './three/EXRLoader.js';

// import * as THREE from 'three';
// import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
// import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
// import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
// import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';


// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.0/build/three.module.js';
// import { DDSLoader } from 'https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/loaders/DDSLoader.js';
// import { KTX2Loader } from 'https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/loaders/KTX2Loader.js';
// import { TGALoader } from 'https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/loaders/TGALoader.js';
// import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/loaders/RGBELoader.js';
// import { EXRLoader } from 'https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/loaders/EXRLoader.js';

/**
 * UniversalTextureRenderer - supports DDS, KTX2, TGA, HDR, EXR, PNG, JPG, etc.
 */
class UniversalTextureRenderer {
  constructor() {
  this.loaders = {
    dds: typeof DDSLoader !== 'undefined' ? new DDSLoader() : null,
    ktx2: typeof KTX2Loader !== 'undefined' ? new KTX2Loader() : null,
    tga: typeof TGALoader !== 'undefined' ? new TGALoader() : null,
    hdr: typeof RGBELoader !== 'undefined' ? new RGBELoader() : null,
    exr: typeof EXRLoader !== 'undefined' ? new EXRLoader() : null,
    png: new THREE.TextureLoader(),
    jpg: new THREE.TextureLoader(),
    jpeg: new THREE.TextureLoader(),
    webp: new THREE.TextureLoader(),
    avif: new THREE.TextureLoader(),
  };

    this.renderer = null;
  }

  /**
   * Get file extension in lowercase.
   */
  getExtension(url) {
    const m = url.match(/\.([a-z0-9]+)$/i);
    return m ? m[1].toLowerCase() : '';
  }async loadTexture(url) {
  const ext = this.getExtension(url);

  // If loader already exists and is initialized, use it
  if (this.loaders[ext]) {
    return new Promise((resolve, reject) => {
      this.loaders[ext].load(url, resolve, undefined, reject);
    });
  }

  // If loader exists but is null (statically undefined), dynamically import it
  switch (ext) {
    case 'dds': {
      const { DDSLoader } = await import('../three/DDSLoader.js');
      this.loaders.dds = new DDSLoader();
      break;
    }

    case 'ktx2': {
      const { KTX2Loader } = await import('../three/KTX2Loader.js');
      const loader = new KTX2Loader();
      loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/libs/basis/');
      loader.detectSupport(this.renderer); // renderer must be set before this!
      this.loaders.ktx2 = loader;
      break;
    }

    case 'tga': {
      const { TGALoader } = await import('../three/TGALoader.js');
      this.loaders.tga = new TGALoader();
      break;
    }

    case 'hdr': {
      const { RGBELoader } = await import('../three/RGBELoader.js');
      this.loaders.hdr = new RGBELoader();
      break;
    }

    case 'exr': {
      const { EXRLoader } = await import('../three/EXRLoader.js');
      this.loaders.exr = new EXRLoader();
      break;
    }

    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'avif': {
      this.loaders[ext] = new THREE.TextureLoader();
      break;
    }

    default:
      throw new Error(`Unsupported texture format: .${ext}`);
  }

  // Retry load now that loader has been initialized
  const loader = this.loaders[ext];
  if (!loader) {
    throw new Error(`Loader for .${ext} could not be initialized.`);
  }

  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}




  /**
   * Initialize WebGL renderer and scene for given size.
   */
  initRenderer(width, height) {
    if (this.width === width && this.height === height && this.renderer) return;

    this.width = width;
    this.height = height;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.OrthographicCamera(
      width / -2, width / 2,
      height / 2, height / -2,
      1, 1000
    );
    this.camera.position.z = 10;

    this.scene = new THREE.Scene();

    this.geometry = new THREE.PlaneGeometry(width, height);
    const uv = this.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setY(i, 1 - uv.getY(i));
    }
    uv.needsUpdate = true;

    this.material = new THREE.MeshBasicMaterial({ transparent: true });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  /**
   * Loads, renders, and converts the texture to blob.
   */
  async loadAndRender(url) {
    const texture = await this.loadTexture(url);
    texture.colorSpace = THREE.SRGBColorSpace;

    const width = texture.image.width;
    const height = texture.image.height;

    this.initRenderer(width, height);

    this.material.map = texture;
    this.material.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);

    return new Promise((resolve) => {
      this.canvas.toBlob(blob => resolve(blob));
    });
  }
}

window.textureRenderer = new UniversalTextureRenderer();


const transparentPlaceholder = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

// async function replaceUnsupportedImages() {
//   const imgs = document.querySelectorAll('img[data-texture-src]');

//   const jobs = Array.from(imgs).map(async img => {
//     const src = img.getAttribute('data-texture-src');
//     img.src = transparentPlaceholder;

//     try {
//       const blob = await textureRenderer.loadAndRender(src);
//       const url = URL.createObjectURL(blob);
//       img.onload = () => URL.revokeObjectURL(url);
//       img.src = url;
//     } catch (e) {
//       console.error('Failed to render texture:', src, e);
//     }
//   });

//   await Promise.all(jobs);
// }

// window.addEventListener('DOMContentLoaded', replaceUnsupportedImages);


/**
 * Prepares DDS <img> tags by setting a transparent placeholder and storing original source.
 */
function prepareDDSImages() {
  const imgs = document.querySelectorAll('img[src$=".dds"]');

  imgs.forEach(img => {
    const originalSrc = img.getAttribute("src");
    img.setAttribute("data-original-src", originalSrc);
    img.src = transparentPlaceholder;
  });

  return imgs;
}

/**
 * Renders DDS to an image blob and replaces <img>.src with the result (no DOM replacement).
 */
async function renderDDSImage(img) {
    const ddsSrc = img.getAttribute("data-original-src");
  try {


    // const blob = await ddsRenderer.loadAndRender(ddsSrc);
    const blob = await textureRenderer.loadAndRender(ddsSrc);
    const url = URL.createObjectURL(blob);
    img.onload = () => URL.revokeObjectURL(url);
    img.src = url;


  } catch (e) {
    img.src = ddsSrc
    img.removeAttribute("data-original-src")
    // console.error('Failed to render DDS image:', img, e);
  }
}

/**
 * Loads all DDS images in parallel using Promise.all.
 */
async function patchDDSImagesParallel() {
  const imgs = prepareDDSImages();
  const jobs = Array.from(imgs).map(img => renderDDSImage(img));
  await Promise.all(jobs);
}

/**
 * Optional: Concurrency-limited loader for safer memory use.
 */
async function parallelWithLimit(tasks, limit = 4) {
  const queue = tasks.slice();
  const results = [];

  async function worker() {
    while (queue.length) {
      const task = queue.shift();
      results.push(await task());
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

/**
 * Loads DDS images with controlled concurrency (use this for large batches).
 */
async function patchDDSImagesWithLimit(limit = 4) {
  const imgs = prepareDDSImages();
  await parallelWithLimit(
    Array.from(imgs).map(img => () => renderDDSImage(img)),
    limit
  );
}

/**
 * Observes DOM for dynamically added DDS <img> tags and processes them.
 */
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === 1 && node.tagName === 'IMG') {
        const src = node.getAttribute('src');
        if (src && src.toLowerCase().endsWith('.dds')) {
          // Immediately swap to placeholder and render
          node.setAttribute('data-original-src', src);
          node.src = transparentPlaceholder;
          renderDDSImage(node);
        }
      }
    }
  }
});

// Start observer for dynamic content
observer.observe(document.body, { childList: true, subtree: true });

// Run the patcher when DOM is ready
window.addEventListener('DOMContentLoaded', patchDDSImagesParallel);

// Optionally export functions if used in a module system
export {
  UniversalTextureRenderer,
  patchDDSImagesParallel,
  patchDDSImagesWithLimit
};