import { Bed, BedRepo } from '../../domain/ports';
import { supabase } from '../../lib/supabase';

export class SupabaseBedRepo implements BedRepo {
  async listBeds(): Promise<Bed[]> {
    const { data, error } = await supabase
      .from('beds')
      .select('*')
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching beds:', error);
      return [];
    }

    return data.map(bedData => ({
      ...bedData,
      created_at: new Date(bedData.created_at),
    }));
  }

  async getBed(id: string): Promise<Bed | null> {
    const { data, error } = await supabase
      .from('beds')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching bed:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      created_at: new Date(data.created_at),
    };
  }

  async create(bed: Omit<Bed, 'id' | 'created_at' | 'user_id'>): Promise<Bed> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('beds')
      .insert({
        ...bed,
        user_id: user.data.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bed:', error);
      throw error;
    }

    return {
      ...data,
      created_at: new Date(data.created_at),
    };
  }

  async update(id: string, updates: Partial<Bed>): Promise<Bed> {
    const { data, error } = await supabase
      .from('beds')
      .update({
        ...updates,
        created_at: updates.created_at?.toISOString() || undefined,
        deleted_at: updates.deleted_at?.toISOString() || undefined,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bed:', error);
      throw error;
    }

    return {
      ...data,
      created_at: new Date(data.created_at),
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('beds')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error soft-deleting bed:', error);
      throw error;
    }
  }
}
