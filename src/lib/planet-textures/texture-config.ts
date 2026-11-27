/**
 * Planet Texture Configuration
 *
 * This module defines the mapping between planet names and their corresponding
 * texture image paths and material types for the solar system visualization.
 *
 * Material Types:
 * - "basic": Used for the Sun to create an emissive, self-illuminated effect
 * - "standard": Used for all planets to enable realistic lighting and shading
 */

export interface PlanetTextureConfig {
  /** The name of the celestial body */
  name: string;
  /** Path to the texture image file in the public directory */
  texturePath: string;
  /** Smaller WebP used for distant bodies in the overview. */
  overviewPath: string;
  overviewWidth: number;
  /** Material type: "basic" for emissive Sun, "standard" for planets */
  materialType: "standard" | "basic";
}

/**
 * Texture configuration mapping for all celestial bodies in the solar system.
 * Maps planet names to their texture paths and appropriate material types.
 */
export const PLANET_TEXTURES: Record<string, PlanetTextureConfig> = {
  Sun: {
    name: "Sun",
    texturePath: "/textures/sun.jpg",
    overviewPath: "/textures/overview/sun.webp",
    overviewWidth: 1024,
    materialType: "basic", // Emissive material for self-illumination
  },
  Mercury: {
    name: "Mercury",
    texturePath: "/textures/mercury.jpg",
    overviewPath: "/textures/overview/mercury.webp",
    overviewWidth: 512,
    materialType: "standard",
  },
  Venus: {
    name: "Venus",
    texturePath: "/textures/venus.jpg",
    overviewPath: "/textures/overview/venus.webp",
    overviewWidth: 512,
    materialType: "standard",
  },
  Earth: {
    name: "Earth",
    texturePath: "/textures/earth.jpg",
    overviewPath: "/textures/overview/earth.webp",
    overviewWidth: 504,
    materialType: "standard",
  },
  Mars: {
    name: "Mars",
    texturePath: "/textures/mars.jpg",
    overviewPath: "/textures/overview/mars.webp",
    overviewWidth: 512,
    materialType: "standard",
  },
  Jupiter: {
    name: "Jupiter",
    texturePath: "/textures/jupiter.jpg",
    overviewPath: "/textures/overview/jupiter.webp",
    overviewWidth: 512,
    materialType: "standard",
  },
  Saturn: {
    name: "Saturn",
    texturePath: "/textures/saturn.jpg",
    overviewPath: "/textures/overview/saturn.webp",
    overviewWidth: 512,
    materialType: "standard",
  },
  Uranus: {
    name: "Uranus",
    texturePath: "/textures/uranus.jpg",
    overviewPath: "/textures/overview/uranus.webp",
    overviewWidth: 512,
    materialType: "standard",
  },
  Neptune: {
    name: "Neptune",
    texturePath: "/textures/neptune.jpg",
    overviewPath: "/textures/overview/neptune.webp",
    overviewWidth: 512,
    materialType: "standard",
  },
};
