import { useState } from "react";
import { Vector3, type Mesh } from "three";
import type { PlanetData } from "@/data/planet-types";
import { PLANET_TEXTURES } from "@/lib/planet-textures/texture-config";
import { usePlanetMaterial } from "./usePlanetMaterial";

const cameraSpaceCenter = new Vector3();

export function useScenePlanetMaterial(planet: PlanetData, radius: number) {
  const [detail, setDetail] = useState(false);
  const material = usePlanetMaterial(planet, detail ? "detail" : "overview");

  // Three calls this only for visible meshes, after updating their world matrices.
  const onBeforeRender: Mesh["onBeforeRender"] = function (
    this: Mesh, renderer, _scene, camera,
  ) {
    if (detail) return;
    cameraSpaceCenter.setFromMatrixPosition(this.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
    const depth = -cameraSpaceCenter.z;
    if (depth <= 0) return;
    const diameterPixels =
      renderer.domElement.height * camera.projectionMatrix.elements[5] * radius / depth;
    // At the center of the disk, a sphere spans about textureWidth / pi texels.
    if (diameterPixels * Math.PI > PLANET_TEXTURES[planet.name]?.overviewWidth) {
      setDetail(true);
    }
  };
  return { material, onBeforeRender };
}
