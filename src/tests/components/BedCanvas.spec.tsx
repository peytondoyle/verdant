import { vi } from "vitest";
import BedCanvas from "@/components/BedCanvas";
import { render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { makeBed, makePlant } from "../__helpers__/factories";

describe("BedCanvas", () => {
  const bed = makeBed({ base_image_url: null });
  const plants = [
    makePlant({ id: "p1", x: 5, y: 10, z_layer: 0 }),
    makePlant({ id: "p2", x: 20, y: 15, z_layer: 1 }),
  ];

  it("renders without crashing", () => {
    const { getByTestId } = render(
      <BedCanvas
        bed={{ id: bed.id, base_image_url: bed.base_image_url ?? null }}
        plants={plants.map(p => ({ id: p.id, x: p.x, y: p.y, z_layer: p.z_layer }))}
        onPlantPress={vi.fn()}
        onAddPlant={vi.fn()}
        onAddPhoto={vi.fn()}
        onAddTask={vi.fn()}
        onPhotoPress={vi.fn()}
        onTaskPress={vi.fn()}
      />
    );
    expect(getByTestId("bed-canvas")).toBeTruthy();
  });

  it("shows plants", () => {
    const { queryAllByTestId } = render(
      <BedCanvas
        bed={{ id: bed.id, base_image_url: bed.base_image_url ?? null }}
        plants={plants.map(p => ({ id: p.id, x: p.x, y: p.y, z_layer: p.z_layer }))}
        onPlantPress={vi.fn()}
        onAddPlant={vi.fn()}
        onAddPhoto={vi.fn()}
        onAddTask={vi.fn()}
        onPhotoPress={vi.fn()}
        onTaskPress={vi.fn()}
      />
    );
    // Adjust testid to whatever PlantSprite uses, or query by role/text if applicable
    const plantNodes = queryAllByTestId(/plant-sprite-/);
    expect(plantNodes.length).toBeGreaterThan(0);
  });

  it("displays a fallback when no base image is provided", () => {
    const { getByText } = render(
      <BedCanvas
        bed={{ id: bed.id, base_image_url: null }}
        plants={[]}
        onPlantPress={vi.fn()}
        onAddPlant={vi.fn()}
        onAddPhoto={vi.fn()}
        onAddTask={vi.fn()}
        onPhotoPress={vi.fn()}
        onTaskPress={vi.fn()}
      />
    );
    expect(getByText("No base image for this bed.")).toBeTruthy();
  });

  it("displays the correct number of plants", () => {
    const { getAllByTestId } = render(
      <BedCanvas
        bed={{ id: bed.id, base_image_url: bed.base_image_url ?? null }}
        plants={plants.map(p => ({ id: p.id, x: p.x, y: p.y, z_layer: p.z_layer }))}
        onPlantPress={vi.fn()}
        onAddPlant={vi.fn()}
        onAddPhoto={vi.fn()}
        onAddTask={vi.fn()}
        onPhotoPress={vi.fn()}
        onTaskPress={vi.fn()}
      />
    );
    expect(getAllByTestId("plant-sprite").length).toBe(plants.length);
  });
});