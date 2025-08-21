import { describe, expect, it } from 'vitest';

describe('BedCanvas', () => {
  it('can import BedCanvas component', async () => {
    // Test that we can import the BedCanvas component without errors
    const BedCanvas = await import('@/components/BedCanvas');
    expect(BedCanvas.default).toBeDefined();
    expect(typeof BedCanvas.default).toBe('function');
  });
  
  it('can import test factories', async () => {
    // Test that our factories work correctly  
    const { makeBed, makePlant } = await import('../__helpers__/factories');
    
    const bed = makeBed({ base_image_url: undefined });
    expect(bed).toHaveProperty('id');
    expect(bed).toHaveProperty('name');
    expect(bed.base_image_url).toBeUndefined();

    const plant = makePlant({ id: 'test-plant' });
    expect(plant).toHaveProperty('id', 'test-plant');
    expect(plant).toHaveProperty('x');
    expect(plant).toHaveProperty('y');
    expect(plant).toHaveProperty('z_layer');
  });
});