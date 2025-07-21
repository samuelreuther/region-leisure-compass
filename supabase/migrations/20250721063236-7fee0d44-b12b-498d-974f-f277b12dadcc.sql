-- Add unique constraint for external_id and source to enable upserts
ALTER TABLE public.activities 
ADD CONSTRAINT activities_external_id_source_key UNIQUE (external_id, source);

-- Create index for better performance on lookups
CREATE INDEX idx_activities_source ON public.activities(source);
CREATE INDEX idx_activities_location ON public.activities(location);
CREATE INDEX idx_activities_category ON public.activities(category);