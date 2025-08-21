import type { Bed, Plant, Task, RepeatRule } from "@/domain/ports";

export function makeBed(overrides: Partial<Bed> = {}): Bed {
  return {
    id: "bed_1",
    user_id: "user_1",
    name: "Front Bed",
    base_image_url: null,
    created_at: new Date("2023-01-01T00:00:00Z"),
    deleted_at: undefined,
    ...overrides,
  };
}

export function makePlant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: "plant_1",
    bed_id: "bed_1",
    name: "Calendula",
    type: "Annual",
    planted_on: new Date("2023-01-01T00:00:00Z"),
    sprite_url: "http://example.com/sprite.png",
    x: 10,
    y: 20,
    z_layer: 0,
    notes: "Test plant notes",
    ...overrides,
  };
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task_1",
    bed_id: "bed_1",
    plant_id: "plant_1",
    kind: "water",
    due_on: new Date("2023-01-15T00:00:00Z"),
    repeat_rule: { type: 'none' },
    completed_on: undefined,
    notes: "Test task notes",
    created_at: new Date("2023-01-01T00:00:00Z"),
    deleted_at: undefined,
    ...overrides,
  };
}