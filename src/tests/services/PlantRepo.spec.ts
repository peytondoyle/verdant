import { supabase } from '@/lib/supabase';
import { SupabasePlantRepo } from '@/services/db/SupabasePlantRepo';
import { Plant } from '@/state/plantsStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPlant: Plant = {
  id: 'plant1',
  bedId: 'bed1',
  name: 'Test Plant',
  type: 'Flower',
  plantedOn: '2023-01-01',
  spriteUrl: 'http://example.com/sprite.png',
  x: 10,
  y: 20,
  zLayer: 0,
  notes: '',
  photoCount: 0,
  deletedAt: null,
};

describe('SupabasePlantRepo', () => {
  let plantRepo: SupabasePlantRepo;
  let mockFrom: any;

  beforeEach(() => {
    plantRepo = new SupabasePlantRepo();
    mockFrom = vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [mockPlant], error: null }),
    }));
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should update plant position with correct payload', async () => {
    const newX = 100;
    const newY = 200;
    await plantRepo.updatePlant('plant1', { x: newX, y: newY });

    expect(supabase.from).toHaveBeenCalledWith('plants');
    expect(mockFrom().update).toHaveBeenCalledWith({
      x: newX,
      y: newY,
    });
    expect(mockFrom().eq).toHaveBeenCalledWith('id', 'plant1');
  });

  it('should update plant zLayer with correct payload', async () => {
    const newZLayer = 5;
    await plantRepo.updatePlant('plant1', { zLayer: newZLayer });

    expect(supabase.from).toHaveBeenCalledWith('plants');
    expect(mockFrom().update).toHaveBeenCalledWith({
      z_layer: newZLayer,
    });
    expect(mockFrom().eq).toHaveBeenCalledWith('id', 'plant1');
  });

  // Placeholder for PhotoRepo checksum test
  describe('SupabasePhotoRepo', () => {
    it.todo('should have a no-op test for checksum to prevent duplicate photo uploads');
  });
});
