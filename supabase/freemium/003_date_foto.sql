alter table freemium.plant_photos add column if not exists taken_on date;
alter table freemium.plants add column if not exists cover_photo_date date;
