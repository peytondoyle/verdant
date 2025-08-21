import { Plant, PlantRepo } from '../../domain/ports';
import { supabase } from '../../lib/supabase';

export class SupabasePlantRepo implements PlantRepo {
  async getPlant(id: string): Promise<Plant | null> {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching plant:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      type: data.type as Plant['type'], // Type assertion for enum
      planted_on: new Date(data.planted_on),
    };
  }

  async listPlants(bedId: string): Promise<Plant[]> {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('bed_id', bedId)
      .is('deleted_at', null)
      .order('planted_on', { ascending: true });

    if (error) {
      console.error('Error fetching plants by bed ID:', error);
      return [];
    }

    return data.map(plantData => ({
      ...plantData,
      type: plantData.type as Plant['type'],
      planted_on: new Date(plantData.planted_on),
    }));
  }

  async create(plant: Omit<Plant, 'id' | 'created_at'>): Promise<Plant> {
    const { data, error } = await supabase
      .from('plants')
      .insert({
        ...plant,
        planted_on: plant.planted_on.toISOString().split('T')[0], // Format date for Supabase
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating plant:', error);
      throw error;
    }

    return {
      ...data,
      type: data.type as Plant['type'],
      planted_on: new Date(data.planted_on),
    };
  }

  async update(id: string, updates: Partial<Plant>): Promise<Plant> {
    const updateData: any = { ...updates };

    if (updateData.planted_on) {
      updateData.planted_on = updateData.planted_on.toISOString().split('T')[0];
    }
    if (updateData.deleted_at) {
      updateData.deleted_at = updateData.deleted_at.toISOString();
    }

    const { data, error } = await supabase
      .from('plants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating plant:', error);
      throw error;
    }

    return {
      ...data,
      type: data.type as Plant['type'],
      planted_on: new Date(data.planted_on),
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('plants')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error soft-deleting plant:', error);
      throw error;
    }
  }
}
