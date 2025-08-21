import { BedCanvas } from '@/components/BedCanvas';
import { Bed } from '@/src/domain/ports';
import { Plant } from '@/src/state/plantsStore';
import { render } from '@testing-library/react-native';
import { describe, expect, it } from 'vitest';

describe('BedCanvas', () => {
  const mockBed: Bed = {
    id: 'bed1',
    userId: 'user1',
    name: 'Test Bed',
    baseImageUrl: undefined, 
    createdAt: '2023-01-01',
    deletedAt: null,
  };

  const mockPlants: Plant[] = [
    {
      id: 'plant1',
      bedId: 'bed1',
      name: 'Rose',
      type: 'Flower',
      plantedOn: '2023-01-01',
      spriteUrl: 'url',
      x: 0,
      y: 0,
      zLayer: 0,
      notes: '',
      photoCount: 0,
      deletedAt: null,
    },
    {
      id: 'plant2',
      bedId: 'bed1',
      name: 'Tulip',
      type: 'Flower',
      plantedOn: '2023-01-01',
      spriteUrl: 'url',
      x: 50,
      y: 50,
      zLayer: 1,
      notes: '',
      photoCount: 0,
      deletedAt: null,
    },
  ];

  it('renders correctly with a bed and plants', () => {
    const { getByTestId, getAllByTestId } = render(
      <BedCanvas
        bed={mockBed}
        plants={mockPlants}
        onPlantPress={vi.fn()}
        onPlantLongPress={vi.fn()}
        onPlantDragEnd={vi.fn()}
        onCanvasLongPress={vi.fn()}
      />
    );

    // Assert that the canvas is rendered
    expect(getByTestId('bed-canvas')).toBeTruthy();

    // Assert that plants are rendered (based on testID in PlantSprite)
    expect(getAllByTestId('plant-sprite').length).toBe(mockPlants.length);
  });

  it('displays a fallback when no base image is provided', () => {
    const { getByText } = render(
      <BedCanvas
        bed={{ ...mockBed, baseImageUrl: undefined }}
        plants={[]}
        onPlantPress={vi.fn()}
        onPlantLongPress={vi.fn()}
        onPlantDragEnd={vi.fn()}
        onCanvasLongPress={vi.fn()}
      />
    );
    expect(getByText('No base image for this bed.')).toBeTruthy();
  });

  it('displays the correct number of plants', () => {
    const { getAllByTestId } = render(
      <BedCanvas
        bed={mockBed}
        plants={mockPlants}
        onPlantPress={vi.fn()}
        onPlantLongPress={vi.fn()}
        onPlantDragEnd={vi.fn()}
        onCanvasLongPress={vi.fn()}
      />
    );
    expect(getAllByTestId('plant-sprite').length).toBe(mockPlants.length);
  });
});
