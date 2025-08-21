import { MediaStorage } from "../../domain/ports";
import { supabase } from "../../lib/supabase";

export class SupabaseMediaStorage implements MediaStorage {
  private async uploadFile(file: File, path: string, bucket: string): Promise<string> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { 
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      throw error;
    }

    // Construct the public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrlData.publicUrl;
  }

  async uploadOriginal(file: File, path: string): Promise<string> {
    return this.uploadFile(file, path, "photos");
  }

  async uploadThumb(file: File, path: string): Promise<string> {
    return this.uploadFile(file, path, "thumbs");
  }

  async getSignedUrl(path: string): Promise<string> {
    // Assuming 'photos' is the default bucket for general file access if not specified
    const { data, error } = await supabase.storage.from("photos").createSignedUrl(path, 60 * 60); // URL valid for 1 hour

    if (error) {
      throw error;
    }
    return data.signedUrl;
  }

  async deleteFile(path: string): Promise<void> {
    // Determine bucket from path if necessary, or assume a default
    // For simplicity, let's assume path includes bucket info or we infer from context
    // For now, let's assume files are in 'photos' bucket for deletion if not explicitly handled.
    const { error } = await supabase.storage.from("photos").remove([path]);
    if (error) {
      throw error;
    }
  }
}
