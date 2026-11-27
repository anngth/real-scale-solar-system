/**
 * Integration tests for Planet component with real texture system
 *
 * Tests verify:
 * - All 8 planets and Sun render correctly with new texture system
 * - Proper textures are loaded and applied
 * - Loading states work correctly
 * - Error handling with fallback to base colors
 * - Data completeness and configuration
 *
 * Requirements: 1.1, 1.2
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { Texture, TextureLoader, type MeshStandardMaterial } from "three";
import { usePlanetMaterial } from "@/features/planet-rendering/application/usePlanetMaterial";
import { Canvas } from "@react-three/fiber";
import { Planet } from "@/features/planet-rendering/ui/planet/index";
import { sunData, planetData } from "@/data/planet-data";
import { PlanetData } from "@/data/planet-types";
import { textureCache } from "@/utils/texture-cache";
import { PLANET_TEXTURES } from "@/lib/planet-textures/texture-config";

describe("Planet Component - Texture Integration", () => {
  beforeEach(() => {
    // Clear texture cache before each test
    textureCache.clear();
  });

  /**
   * Test 1: Verify all 8 planets render with texture system
   * Requirement: 1.1, 1.2
   */
  it("should render all 8 planets with texture system", async () => {
    const mockOnClick = () => {};

    for (const planet of planetData) {
      const { container } = render(
        <Canvas>
          <Planet
            planet={planet}
            simulationSpeed={1}
            onClick={mockOnClick}
            showLabels={false}
            showOrbitPath={false}
          />
        </Canvas>
      );

      // Verify component renders without crashing
      expect(container).toBeTruthy();

      // Wait for async texture loading
      await waitFor(
        () => {
          // Component should be in the DOM
          expect(container.querySelector("canvas")).toBeTruthy();
        },
        { timeout: 3000 }
      );
    }
  });

  /**
   * Test 2: Verify Sun renders with texture system
   * Requirement: 1.1, 1.2
   */
  it("should render Sun with texture system", async () => {
    const mockOnClick = () => {};

    const { container } = render(
      <Canvas>
        <Planet
          planet={sunData}
          simulationSpeed={1}
          onClick={mockOnClick}
          showLabels={false}
          showOrbitPath={false}
        />
      </Canvas>
    );

    expect(container).toBeTruthy();

    await waitFor(
      () => {
        expect(container.querySelector("canvas")).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  /**
   * Test 3: Verify specific planets render correctly
   * Tests Earth, Mars, and Jupiter specifically
   * Requirement: 1.2
   */
  it("should render Earth, Mars, and Jupiter with correct setup", async () => {
    const testPlanets = planetData.filter((p) =>
      ["Earth", "Mars", "Jupiter"].includes(p.name)
    );
    const mockOnClick = () => {};

    for (const planet of testPlanets) {
      const { container, unmount } = render(
        <Canvas>
          <Planet
            planet={planet}
            simulationSpeed={1}
            onClick={mockOnClick}
            showLabels={true}
            showOrbitPath={true}
          />
        </Canvas>
      );

      await waitFor(
        () => {
          expect(container.querySelector("canvas")).toBeTruthy();
        },
        { timeout: 3000 }
      );

      // Cleanup
      unmount();
    }
  });

  /**
   * Test 4: Verify texture loading doesn't block rendering
   * Component should render with fallback color while texture loads
   * Requirement: 1.1
   */
  it("should render with fallback color while texture loads", () => {
    const mockOnClick = () => {};
    const earth = planetData.find((p) => p.name === "Earth")!;

    const { container } = render(
      <Canvas>
        <Planet
          planet={earth}
          simulationSpeed={1}
          onClick={mockOnClick}
          showLabels={false}
          showOrbitPath={false}
        />
      </Canvas>
    );

    // Should render immediately (with fallback material)
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  /**
   * Test 5: Verify all planets have texture configurations
   * Each planet should have a texture configuration
   * Requirement: 1.2
   */
  it("should have texture configurations for all planets", () => {
    const allCelestialBodies = [sunData, ...planetData];

    for (const body of allCelestialBodies) {
      // Each body should have a texture configuration
      const config = PLANET_TEXTURES[body.name];
      expect(config).toBeDefined();
      expect(config.name).toBe(body.name);
      expect(config.texturePath).toBeTruthy();
      expect(config.materialType).toMatch(/^(standard|basic)$/);
    }
  });

  /**
   * Test 6: Verify Sun uses basic material type
   * Sun should use "basic" material for emissive effect
   * Requirement: 1.2
   */
  it("should configure Sun with basic material type", () => {
    const sunConfig = PLANET_TEXTURES["Sun"];
    expect(sunConfig).toBeDefined();
    expect(sunConfig.materialType).toBe("basic");
  });

  /**
   * Test 7: Verify planets use standard material type
   * All planets should use "standard" material
   * Requirement: 1.2
   */
  it("should configure planets with standard material type", () => {
    for (const planet of planetData) {
      const config = PLANET_TEXTURES[planet.name];
      expect(config).toBeDefined();
      expect(config.materialType).toBe("standard");
    }
  });

  /**
   * Test 8: Verify component handles missing texture gracefully
   * Should fall back to base color without crashing
   * Requirement: 1.1
   */
  it("should handle missing texture configuration gracefully", async () => {
    const mockOnClick = () => {};
    const fakePlanet: PlanetData = {
      ...planetData[0],
      name: "NonExistentPlanet",
      color: "#FF0000",
    };

    const { container } = render(
      <Canvas>
        <Planet
          planet={fakePlanet}
          simulationSpeed={1}
          onClick={mockOnClick}
          showLabels={false}
          showOrbitPath={false}
        />
      </Canvas>
    );

    // Should still render without crashing
    expect(container.querySelector("canvas")).toBeTruthy();

    await waitFor(
      () => {
        // Component should remain stable
        expect(container.querySelector("canvas")).toBeTruthy();
      },
      { timeout: 1000 }
    );
  });

  /**
   * Test 9: Verify multiple renders of same planet
   * Should work correctly when same planet is rendered multiple times
   * Requirement: 1.1, 1.2
   */
  it("should handle multiple renders of the same planet", async () => {
    const mockOnClick = () => {};
    const earth = planetData.find((p) => p.name === "Earth")!;

    const { container: container1 } = render(
      <Canvas>
        <Planet
          planet={earth}
          simulationSpeed={1}
          onClick={mockOnClick}
          showLabels={false}
          showOrbitPath={false}
        />
      </Canvas>
    );

    const { container: container2 } = render(
      <Canvas>
        <Planet
          planet={earth}
          simulationSpeed={1}
          onClick={mockOnClick}
          showLabels={false}
          showOrbitPath={false}
        />
      </Canvas>
    );

    expect(container1.querySelector("canvas")).toBeTruthy();
    expect(container2.querySelector("canvas")).toBeTruthy();

    await waitFor(
      () => {
        expect(container1.querySelector("canvas")).toBeTruthy();
        expect(container2.querySelector("canvas")).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  /**
   * Test 10: Verify component cleanup
   * Should properly clean up when unmounted
   * Requirement: 1.1
   */
  it("should clean up properly when unmounted", async () => {
    const mockOnClick = () => {};
    const mars = planetData.find((p) => p.name === "Mars")!;

    const { unmount } = render(
      <Canvas>
        <Planet
          planet={mars}
          simulationSpeed={1}
          onClick={mockOnClick}
          showLabels={false}
          showOrbitPath={false}
        />
      </Canvas>
    );

    await waitFor(
      () => {
        // Let component mount and load
      },
      { timeout: 1000 }
    );

    // Should unmount without errors
    expect(() => unmount()).not.toThrow();
  });

  /**
   * Test 11: Verify all required planets are in planetData
   * Ensures data completeness for the solar system
   * Requirement: 1.2
   */
  it("should have data for all 8 planets", () => {
    const requiredPlanets = [
      "Mercury",
      "Venus",
      "Earth",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
    ];

    const planetNames = planetData.map((p) => p.name);

    for (const required of requiredPlanets) {
      expect(planetNames).toContain(required);
    }

    expect(planetData.length).toBe(8);
  });

  /**
   * Test 12: Verify Sun data exists
   * Requirement: 1.2
   */
  it("should have Sun data available", () => {
    expect(sunData).toBeTruthy();
    expect(sunData.name).toBe("Sun");
    expect(sunData.color).toBeTruthy();
  });

  /**
   * Test 13: Verify texture paths follow naming convention
   * All texture paths should follow /textures/{name}.jpg pattern
   * Requirement: 1.2
   */
  it("should have consistent texture path naming", () => {
    const allCelestialBodies = [sunData, ...planetData];

    for (const body of allCelestialBodies) {
      const config = PLANET_TEXTURES[body.name];
      expect(config.texturePath).toMatch(/^\/textures\/[a-z]+\.(jpg|png)$/);
    }
  });
});

it("keeps the overview visible while the scene and modal share one detail request", async () => {
  const planet = planetData.find((body) => body.name === "Mars")!;
  const { overviewPath, texturePath } = PLANET_TEXTURES.Mars;
  const overview = new Texture();
  const detail = new Texture();
  let resolveDetail!: (texture: Texture) => void;
  const pendingDetail = new Promise<Texture>((resolve) => { resolveDetail = resolve; });
  const loader = vi.spyOn(TextureLoader.prototype, "loadAsync").mockImplementation(
    (path) => path === overviewPath ? Promise.resolve(overview) : pendingDetail,
  );
  textureCache.clear();

  try {
    type Quality = "overview" | "detail";
    const scene = renderHook(({ quality }: { quality: Quality }) => usePlanetMaterial(planet, quality), {
      initialProps: { quality: "overview" as Quality },
    });
    await waitFor(() => expect((scene.result.current as MeshStandardMaterial).map).toBe(overview));
    expect(loader.mock.calls.map(([path]) => path)).toEqual([overviewPath]);

    scene.rerender({ quality: "detail" });
    const modal = renderHook(() => usePlanetMaterial(planet, "detail"));
    expect(modal.result.current).toBe(scene.result.current);
    expect(loader.mock.calls.map(([path]) => path)).toEqual([overviewPath, texturePath]);

    await act(async () => resolveDetail(detail));
    expect((scene.result.current as MeshStandardMaterial).map).toBe(detail);
    expect(modal.result.current).toBe(scene.result.current);
    scene.unmount();
    modal.unmount();
  } finally {
    loader.mockRestore();
    textureCache.clear();
  }
});

it.each(["overview", "detail"] as const)(
  "handles a zoom during the initial request when %s finishes first",
  async (first) => {
    const planet = planetData.find((body) => body.name === "Mars")!;
    const { overviewPath, texturePath } = PLANET_TEXTURES.Mars;
    type Quality = "overview" | "detail";
    const requests = new Map<string, (texture: Texture) => void>();
    const loader = vi.spyOn(TextureLoader.prototype, "loadAsync")
      .mockImplementation((path) => new Promise<Texture>((resolve) => requests.set(path, resolve)));
    textureCache.clear();
    const scene = renderHook(
      ({ quality }: { quality: Quality }) => usePlanetMaterial(planet, quality),
      { initialProps: { quality: "overview" as Quality } },
    );
    try {
      scene.rerender({ quality: "detail" });
      const detail = new Texture();
      const preview = new Texture();
      if (first === "overview") {
        await act(async () => requests.get(overviewPath)!(preview));
        expect((scene.result.current as MeshStandardMaterial).map).toBe(preview);
        await act(async () => requests.get(texturePath)!(detail));
      } else {
        await act(async () => requests.get(texturePath)!(detail));
        await act(async () => requests.get(overviewPath)!(preview));
      }
      expect((scene.result.current as MeshStandardMaterial).map).toBe(detail);
    } finally {
      scene.unmount();
      loader.mockRestore();
      textureCache.clear();
    }
  },
);
