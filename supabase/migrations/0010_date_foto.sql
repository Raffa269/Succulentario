alter table public.plant_photos add column if not exists taken_on date;
alter table public.plants add column if not exists cover_photo_date date;
