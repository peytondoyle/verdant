import { BedPhoto, PhotoRepo, PlantPhoto } from '../../domain/ports';
import { supabase } from '../../lib/supabase';

export class SupabasePhotoRepo implements PhotoRepo {
  private async addPhoto<T extends PlantPhoto | BedPhoto>(
    photo: Omit<T, 'id' | 'captured_on'>,
    tableName: 'plant_photos' | 'bed_photos'
  ): Promise<T> {
    // Check for existing photo with the same checksum and parent ID (plant_id or bed_id)
    const query = supabase
      .from(tableName)
      .select('id')
      .eq('checksum', photo.checksum)
      .is('deleted_at', null);

    if ('plant_id' in photo) {
      query.eq('plant_id', photo.plant_id);
    } else if ('bed_id' in photo) {
      query.eq('bed_id', photo.bed_id);
    }

    const { data: existingPhotos, error: existingError } = await query;

    if (existingError) {
      console.error(`Error checking for existing photo in ${tableName}:`, existingError);
      throw existingError;
    }

    if (existingPhotos && existingPhotos.length > 0) {
      console.log('Duplicate photo detected by checksum. Skipping insertion.');
      // Optionally, fetch and return the existing photo if needed
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', existingPhotos[0].id)
        .single();

      if (error) {
        console.error('Error fetching existing photo:', error);
        throw error;
      }
      return {
        ...data,
        captured_on: new Date(data.captured_on),
      } as T;
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert({
        ...photo,
        captured_on: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(`Error adding photo to ${tableName}:`, error);
      throw error;
    }

    return {
      ...data,
      captured_on: new Date(data.captured_on),
    } as T;
  }

  async getPlantPhotos(plantId: string): Promise<PlantPhoto[]> {
    const { data, error } = await supabase
      .from('plant_photos')
      .select('*')
      .eq('plant_id', plantId)
      .is('deleted_at', null)
      .order('captured_on', { ascending: false });

    if (error) {
      console.error('Error fetching plant photos:', error);
      return [];
    }

    return data.map((row) => ({
      ...row,
      captured_on: new Date(row.captured_on),
    }));
  }

  async getBedPhotos(bedId: string): Promise<BedPhoto[]> {
    const { data, error } = await supabase
      .from('bed_photos')
      .select('*')
      .eq('bed_id', bedId)
      .is('deleted_at', null)
      .order('captured_on', { ascending: false });

    if (error) {
      console.error('Error fetching bed photos:', error);
      return [];
    }

    return data.map((row) => ({
      ...row,
      captured_on: new Date(row.captured_on),
    }));
  }

  async addPlantPhoto(photo: Omit<PlantPhoto, 'id' | 'captured_on'>): Promise<PlantPhoto> {
    return this.addPhoto(photo, 'plant_photos');
  }

  async addBedPhoto(photo: Omit<BedPhoto, 'id' | 'captured_on'>): Promise<BedPhoto> {
    return this.addPhoto(photo, 'bed_photos');
  }

  async deletePhoto(id: string): Promise<void> {
    const { error: plantPhotoError } = await supabase
      .from('plant_photos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    const { error: bedPhotoError } = await supabase
      .from('bed_photos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (plantPhotoError && bedPhotoError) {
      console.error('Error soft-deleting photo from both tables:', plantPhotoError, bedPhotoError);
      throw new Error('Failed to soft-delete photo from both tables.');
    } else if (plantPhotoError) {
      console.error('Error soft-deleting photo from plant_photos:', plantPhotoError);
      throw plantPhotoError;
    } else if (bedPhotoError) {
      console.error('Error soft-deleting photo from bed_photos:', bedPhotoError);
      throw bedPhotoError;
    }
  }
}
