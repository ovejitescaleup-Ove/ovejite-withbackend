import { useEffect } from "react";
export function usePageSEO({ title, description, image, seo_title, meta_description, og_image } = {}) {
  title = seo_title || title;
  description = meta_description || description;
  image = og_image || image;
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
      meta.content = description;
    }
    if (image) {
      let og = document.querySelector('meta[property="og:image"]');
      if (!og) { og = document.createElement("meta"); og.setAttribute("property", "og:image"); document.head.appendChild(og); }
      og.content = image;
    }
  }, [title, description, image]);
}
