import { useState, useEffect } from "react";
import {
  MeshStandardMaterial,
  MeshBasicMaterial,
  TextureLoader,
  Material,
  Texture,
} from "three";
import { PlanetData } from "@/data/planet-types";
import { PLANET_TEXTURES } from "@/lib/planet-textures/texture-config";
import { textureCache } from "@/utils/texture-cache";

// Module-level cache for fallback materials to prevent GPU memory leaks
const fallbackMaterialCache = new Map<string, MeshStandardMaterial>();
const texturedMaterials = new WeakMap<Texture, Material>();
const pendingTextures = new Map<string, Promise<Texture>>();

/**
 * Gets or creates a cached fallback material for the given color.
 * Reuses cached materials to prevent memory leaks.
 */
function getOrCreateFallbackMaterial(color: string): MeshStandardMaterial {
  let cachedFallback = fallbackMaterialCache.get(color);
  if (!cachedFallback) {
    cachedFallback = new MeshStandardMaterial({
      color,
      metalness: 0.1,
      roughness: 0.6,
    });
    fallbackMaterialCache.set(color, cachedFallback);
  }
  return cachedFallback;
}

function loadTexture(name: string, path: string): Promise<Texture> {
  const key = { type: name, path };
  const cached = textureCache.get(key);
  if (cached) return Promise.resolve(cached);

  const pending = pendingTextures.get(path);
  if (pending) return pending;

  const request = new TextureLoader()
    .loadAsync(path)
    .then((texture) => {
      textureCache.set(key, texture);
      return texture;
    })
    .finally(() => pendingTextures.delete(path));
  pendingTextures.set(path, request);
  return request;
}

function materialFor(texture: Texture, type: "basic" | "standard"): Material {
  const cached = texturedMaterials.get(texture);
  if (cached) return cached;
  const material = createMaterialWithTexture(texture, type);
  texturedMaterials.set(texture, material);
  texture.addEventListener("dispose", () => material.dispose());
  return material;
}

export function usePlanetMaterial(
  planet: PlanetData,
  quality: "overview" | "detail" = "detail",
): Material {
  const config = PLANET_TEXTURES[planet.name];
  const path = quality === "overview" ? config?.overviewPath : config?.texturePath;
  const [loaded, setLoaded] = useState<{
    path: string;
    material: Material;
  } | null>(null);

  useEffect(() => {
    if (!config || !path) return;
    let active = true;
    const pendingPreview = path !== config.overviewPath
      ? pendingTextures.get(config.overviewPath)
      : undefined;
    if (pendingPreview) {
      void pendingPreview.then((texture) => {
        if (active) {
          const preview = {
            path: config.overviewPath,
            material: materialFor(texture, config.materialType),
          };
          setLoaded((current) => current?.path === path ? current : preview);
        }
      }, () => {
        // The overview request reports its own error. Detail can still succeed.
      });
    }
    loadTexture(config.name, path).then(
      (texture) => {
        if (active) {
          setLoaded({ path, material: materialFor(texture, config.materialType) });
        }
      },
      (error) => console.error(`Failed to load texture from ${path}:`, error),
    );
    return () => {
      active = false;
    };
  }, [config, path]);

  if (loaded && (loaded.path === path || loaded.path === config?.overviewPath)) {
    return loaded.material;
  }
  const preview = config && textureCache.get({ type: config.name, path: config.overviewPath });
  return preview
    ? materialFor(preview, config.materialType)
    : getOrCreateFallbackMaterial(planet.color);
}

/**
 * Helper function to create the appropriate material type with a loaded texture.
 *
 * IMPORTANT: The color property is intentionally omitted when textures are present.
 * In Three.js, setting a material's color multiplies it with the texture, causing
 * unwanted tinting (e.g., Earth texture would be tinted blue, Mars reddish, etc.).
 * The planet.color from PlanetData is only used as a fallback when no texture
 * configuration exists (see getOrCreateFallbackMaterial).
 *
 * @param texture - The loaded Three.js Texture
 * @param materialType - "basic" for Sun (emissive), "standard" for planets
 * @returns Material instance (MeshBasicMaterial or MeshStandardMaterial) without color property
 */
function createMaterialWithTexture(
  texture: Texture,
  materialType: "standard" | "basic",
): Material {
  if (materialType === "basic") {
    // Sun uses MeshBasicMaterial for emissive, self-illuminated effect
    // Color is intentionally omitted to prevent tinting the texture
    // planet.color is only used as a fallback when textures aren't available
    return new MeshBasicMaterial({
      map: texture,
      // No color property - texture provides all color information
    });
  } else {
    // Planets use MeshStandardMaterial for realistic lighting
    // Color is intentionally omitted to prevent tinting the texture
    // planet.color is only used as a fallback when textures aren't available
    return new MeshStandardMaterial({
      map: texture,
      metalness: 0.1,
      roughness: 0.6,
      // No color property - texture provides all color information
    });
  }
}
