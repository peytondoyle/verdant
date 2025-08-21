// Edge Function to purge soft-deleted photos older than 30 days
// and remove corresponding files from Supabase Storage

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get soft-deleted plant photos older than 30 days
    const { data: plantPhotos, error: plantError } = await supabase
      .from('plant_photos')
      .select('id, image_url')
      .not('deleted_at', 'is', null)
      .lt('deleted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (plantError) {
      throw new Error(`Failed to fetch plant photos: ${plantError.message}`)
    }

    // Get soft-deleted bed photos older than 30 days
    const { data: bedPhotos, error: bedError } = await supabase
      .from('bed_photos')
      .select('id, image_url')
      .not('deleted_at', 'is', null)
      .lt('deleted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (bedError) {
      throw new Error(`Failed to fetch bed photos: ${bedError.message}`)
    }

    const deletedFiles: string[] = []
    const failedFiles: string[] = []

    // Helper function to extract storage path from URL
    const extractStoragePath = (url: string): string => {
      const urlParts = url.split('/')
      const bucketIndex = urlParts.findIndex(part => ['photos', 'thumbs', 'sprites'].includes(part))
      return bucketIndex !== -1 ? urlParts.slice(bucketIndex + 1).join('/') : url
    }

    // Delete files from storage and database records
    const processPhotos = async (photos: any[], tableName: string) => {
      for (const photo of photos) {
        try {
          // Extract storage path from URL
          const storagePath = extractStoragePath(photo.image_url)
          
          // Determine bucket from URL
          const bucket = photo.image_url.includes('/thumbs/') ? 'thumbs' : 'photos'
          
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([storagePath])

          if (storageError) {
            console.warn(`Failed to delete file ${storagePath}: ${storageError.message}`)
            failedFiles.push(photo.image_url)
          } else {
            deletedFiles.push(photo.image_url)
          }

          // Delete database record
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq('id', photo.id)

          if (deleteError) {
            console.warn(`Failed to delete ${tableName} record ${photo.id}: ${deleteError.message}`)
          }
        } catch (error) {
          console.error(`Error processing photo ${photo.id}:`, error)
          failedFiles.push(photo.image_url)
        }
      }
    }

    await processPhotos(plantPhotos || [], 'plant_photos')
    await processPhotos(bedPhotos || [], 'bed_photos')

    const result = {
      success: true,
      processed: {
        plant_photos: plantPhotos?.length || 0,
        bed_photos: bedPhotos?.length || 0,
      },
      deleted_files: deletedFiles.length,
      failed_files: failedFiles.length,
      failed_file_urls: failedFiles,
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Purge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/purge-soft-deleted' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
