# Universal Texture Renderer for Web

This project provides a **Universal Texture Renderer** that loads and renders various game texture formats in the browser using WebGL (via Three.js). It dynamically converts non-standard image formats (DDS, KTX2, TGA, HDR, EXR, etc.) into browser-compatible images without replacing the `<img>` element.

---

## Supported Formats

| Format                      | Loader          | Notes                              |
| --------------------------- | --------------- | ---------------------------------- |
| **DDS**                     | `DDSLoader`     | For `.dds` textures (DXT1/DXT5)    |
| **KTX2**                    | `KTX2Loader`    | Basis Universal / ASTC support     |
| **TGA**                     | `TGALoader`     | Truevision TGA images              |
| **HDR**                     | `RGBELoader`    | High Dynamic Range (Radiance)      |
| **EXR**                     | `EXRLoader`     | OpenEXR format                     |
| **PNG / JPG / WEBP / AVIF** | `TextureLoader` | Fallback to native Three.js loader |

---

## How It Works

1. Detect texture format by file extension.
2. Load the texture using the appropriate Three.js loader.
3. Render the texture to a WebGL canvas.
4. Export the canvas as a `blob` and set it as the `src` of the target `<img>`.

---

## Usage

### 1. **Include images with `data-texture-src`**

```html
<img data-texture-src="textures/my-texture.dds" />
<img data-texture-src="textures/my-texture.ktx2" />
<img data-texture-src="textures/my-texture.tga" />
<img data-texture-src="textures/my-envmap.hdr" />
```

### 2. **Run the renderer**

```js
import { textureRenderer } from './UniversalTextureRenderer.js';

const transparentPlaceholder = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

async function replaceUnsupportedImages() {
  const imgs = document.querySelectorAll('img[data-texture-src]');

  const jobs = Array.from(imgs).map(async img => {
    const src = img.getAttribute('data-texture-src');
    img.src = transparentPlaceholder;

    try {
      const blob = await textureRenderer.loadAndRender(src);
      const url = URL.createObjectURL(blob);
      img.onload = () => URL.revokeObjectURL(url);
      img.src = url;
    } catch (e) {
      console.error('Failed to render texture:', src, e);
    }
  });

  await Promise.all(jobs);
}

window.addEventListener('DOMContentLoaded', replaceUnsupportedImages);
```

---

## Folder Structure

```
project/
├─ lib/
│  └─ three/
│     ├─ three.js
│     ├─ DDSLoader.js
│     ├─ KTX2Loader.js
│     ├─ TGALoader.js
│     ├─ RGBELoader.js
│     └─ EXRLoader.js
├─ UniversalTextureRenderer.js
├─ index.html
```

---

## Features

* **Universal loading** of multiple texture formats.
* **Dynamic resolution** (no fixed canvas size).
* **No DOM replacement**: Original `<img>` element is preserved.
* **Parallel loading** with `Promise.all`.
* **Memory-safe** using `URL.revokeObjectURL()`.

---

## Use Cases

* Game modding tools
* Web-based asset viewers
* Custom editors for game textures
* Interactive documentation and previews

---

## License

MIT License.

---

## Credits

* [Three.js](https://threejs.org/)
* [Basis Universal / KTX2](https://github.com/BinomialLLC/basis_universal)
* [OpenEXR](https://www.openexr.com/)

---

## Contact

For questions or contributions, feel free to open an issue or pull request.
