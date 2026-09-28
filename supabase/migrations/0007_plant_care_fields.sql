alter table plants
  add column if not exists last_repot_date date,
  add column if not exists pot_diameter_cm numeric(5, 1),
  add column if not exists max_height text not null default '???',
  add column if not exists max_width text not null default '???',
  add column if not exists dark_period text not null default '???';
