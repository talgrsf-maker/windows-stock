# Supabase

ב־SQL Editor הרץ לפי הסדר: `schema.sql`, אחריו `policies.sql`, ולבסוף `seed.sql`.

אפשר Realtime עבור הטבלאות `inventory_events` ו־`inventory_event_lines` דרך Database Publications. אין להשתמש במפתח `service_role` בצד הלקוח. לפני מעבר ל־`VITE_DATA_MODE=supabase`, השלם את ה־RPCs המסומנים ב־schema ואת `SupabaseInventoryRepository`.
