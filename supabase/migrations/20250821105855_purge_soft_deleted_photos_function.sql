CREATE OR REPLACE FUNCTION public.purge_soft_deleted_photos()
RETURNS VOID AS $$
DECLARE
    photo_row RECORD;
BEGIN
    -- Delete plant_photos older than 30 days and collect image_urls
    FOR photo_row IN
        DELETE FROM public.plant_photos
        WHERE deleted_at IS NOT NULL
          AND deleted_at < NOW() - INTERVAL '30 days'
        RETURNING image_url
    LOOP
        -- Remove from Supabase Storage (assuming path is derived from image_url)
        -- This part requires calling Supabase Storage API from an Edge Function,
        -- which is not directly callable from PL/pgSQL.
        -- The Edge Function will need to fetch these URLs and call the storage API.
    END LOOP;

    -- Delete bed_photos older than 30 days and collect image_urls
    FOR photo_row IN
        DELETE FROM public.bed_photos
        WHERE deleted_at IS NOT NULL
          AND deleted_at < NOW() - INTERVAL '30 days'
        RETURNING image_url
    LOOP
        -- Same as above, requires Edge Function to handle Storage deletion
    END LOOP;
END;
$$ LANGUAGE plpgsql;
