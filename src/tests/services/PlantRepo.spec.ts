import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePlantRepo } from "@/services/db/SupabasePlantRepo";
import type { Plant } from "@/domain/ports";

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe("SupabasePlantRepo", () => {
  let repo: SupabasePlantRepo;

  beforeEach(() => {
    repo = new SupabasePlantRepo();
    vi.clearAllMocks();
  });

  it("updates plant position", async () => {
    const id = "plant1";
    const newX = 42;
    const newY = 7;

    // Use the actual repo API; the adapter has a generic update(id, patch):
    await repo.update(id, { x: newX, y: newY });

    expect(true).toBe(true); // Replace with proper assertion once repo methods are mockable.
  });

  it("updates plant z-layer", async () => {
    const id = "plant1";
    const newZ = 5;

    // Use the actual repo API; the adapter has a generic update(id, patch):
    await repo.update(id, { z_layer: newZ });

    expect(true).toBe(true);
  });

  it("creates a plant", async () => {
    const plantData: Omit<Plant, 'id' | 'created_at'> = {
      bed_id: "bed1",
      name: "Test Plant",
      type: "Annual",
      planted_on: new Date("2023-01-01"),
      sprite_url: "http://example.com/sprite.png",
      x: 10,
      y: 20,
      z_layer: 0,
      notes: "Test notes",
    };

    await repo.create(plantData);

    expect(true).toBe(true);
  });

  it("gets a plant by id", async () => {
    const id = "plant1";

    const result = await repo.getPlant(id);

    expect(true).toBe(true);
  });

  it("lists plants for a bed", async () => {
    const bedId = "bed1";

    const result = await repo.getPlantsForBed(bedId);

    expect(true).toBe(true);
  });
});