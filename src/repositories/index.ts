import { LocalInventoryRepository } from './LocalInventoryRepository'; import { SupabaseInventoryRepository } from './SupabaseInventoryRepository'; import { GoogleSheetsInventoryRepository } from './GoogleSheetsInventoryRepository';
const mode = import.meta.env.VITE_DATA_MODE;
export const repository = mode === 'supabase' ? new SupabaseInventoryRepository() : mode === 'google_sheets' ? new GoogleSheetsInventoryRepository() : new LocalInventoryRepository();
