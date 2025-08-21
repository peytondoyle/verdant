-- Enums
CREATE TYPE public.plant_type AS ENUM ('perennial', 'annual', 'edible');
CREATE TYPE public.task_kind AS ENUM ('watering', 'fertilizing', 'pruning', 'harvesting', 'planting', 'other');
CREATE TYPE public.photo_source AS ENUM ('plant', 'bed');

-- Tables
CREATE TABLE public.beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    base_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_id UUID REFERENCES public.beds(id) NOT NULL,
    name TEXT NOT NULL,
    type plant_type NOT NULL,
    planted_on DATE,
    sprite_url TEXT,
    z_layer INTEGER,
    x INTEGER,
    y INTEGER,
    notes TEXT,
    photo_count INTEGER DEFAULT 0 NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_id UUID REFERENCES public.beds(id) NOT NULL,
    plant_id UUID REFERENCES public.plants(id),
    kind task_kind NOT NULL,
    due_on DATE NOT NULL,
    repeat_rule TEXT,
    completed_on TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.plant_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID REFERENCES public.plants(id) NOT NULL,
    captured_on TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    image_url TEXT NOT NULL,
    checksum TEXT, -- New: Store a checksum for data integrity/deduplication
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.bed_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_id UUID REFERENCES public.beds(id) NOT NULL,
    captured_on TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    image_url TEXT NOT NULL,
    checksum TEXT, -- New: Store a checksum for data integrity/deduplication
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_plant_photos_captured_on ON public.plant_photos (captured_on DESC);
CREATE INDEX idx_bed_photos_captured_on ON public.bed_photos (captured_on DESC);
CREATE INDEX idx_tasks_due_on ON public.tasks (due_on);

-- Row Level Security (RLS)
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own beds." ON public.beds
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own beds." ON public.beds
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own beds." ON public.beds
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own beds." ON public.beds
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view plants in their beds." ON public.plants
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = plants.bed_id AND beds.user_id = auth.uid()));
CREATE POLICY "Users can insert plants into their beds." ON public.plants
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = plants.bed_id AND beds.user_id = auth.uid()));
CREATE POLICY "Users can update plants in their beds." ON public.plants
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = plants.bed_id AND beds.user_id = auth.uid()));
CREATE POLICY "Users can delete plants from their beds." ON public.plants
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = plants.bed_id AND beds.user_id = auth.uid()));

CREATE POLICY "Users can view tasks in their beds." ON public.tasks
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = tasks.bed_id AND beds.user_id = auth.uid()));
CREATE POLICY "Users can insert tasks into their beds." ON public.tasks
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = tasks.bed_id AND beds.user_id = auth.uid()));
CREATE POLICY "Users can update tasks in their beds." ON public.tasks
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = tasks.bed_id AND beds.user_id = auth.uid()));
CREATE POLICY "Users can delete tasks from their beds." ON public.tasks
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = tasks.bed_id AND beds.user_id = auth.uid()));

CREATE POLICY "Users can view plant photos in their beds." ON public.plant_photos
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.plants p JOIN public.beds b ON p.bed_id = b.id WHERE p.id = plant_photos.plant_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can insert plant photos into their beds." ON public.plant_photos
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.plants p JOIN public.beds b ON p.bed_id = b.id WHERE p.id = plant_photos.plant_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can update plant photos in their beds." ON public.plant_photos
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.plants p JOIN public.beds b ON p.bed_id = b.id WHERE p.id = plant_photos.plant_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can delete plant photos from their beds." ON public.plant_photos
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.plants p JOIN public.beds b ON p.bed_id = b.id WHERE p.id = plant_photos.plant_id AND b.user_id = auth.uid()));

CREATE POLICY "Users can view bed photos in their beds." ON public.bed_photos
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = bed_photos.bed_id AND beds.user_id = auth.uid()));
CREATE POLICY "Users can insert bed photos into their beds." ON public.bed_photos
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = bed_photos.bed_id AND beds.user_id = auth.uid()));
CREATE POLICY "Users can update bed photos in their beds." ON public.bed_photos
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = bed_photos.bed_id AND beds.user_id = auth.uid()));
CREATE POLICY "Users can delete bed photos from their beds." ON public.bed_photos
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.beds WHERE beds.id = bed_photos.bed_id AND beds.user_id = auth.uid()));

-- Trigger for photo_count
CREATE OR REPLACE FUNCTION public.update_plant_photo_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.plants
        SET photo_count = photo_count + 1
        WHERE id = NEW.plant_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.plants
        SET photo_count = photo_count - 1
        WHERE id = OLD.plant_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_plant_photo_count
AFTER INSERT OR DELETE ON public.plant_photos
FOR EACH ROW EXECUTE FUNCTION public.update_plant_photo_count();
