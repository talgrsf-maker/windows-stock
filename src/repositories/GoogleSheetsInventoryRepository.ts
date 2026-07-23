import type { InventoryRepository } from './InventoryRepository';
import type { InventoryEvent, Store } from '../types';

export class GoogleSheetsInventoryRepository implements InventoryRepository {
  private async request<T>(action: string, payload?: unknown): Promise<T> {
    const url = action === 'load' ? '/api/google-sheets?action=load' : '/api/google-sheets';
    const password = sessionStorage.getItem('windows-stock-access-password') ?? '';
    const response = await fetch(url, action === 'load' ? { headers: { 'x-inventory-password': password } } : {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-inventory-password': password },
      body: JSON.stringify({ action, payload }),
    });
    if (!response.ok) throw new Error('לא ניתן להתחבר לשרת Google Sheets.');
    const result = await response.json() as { ok: boolean; data?: T; error?: string };
    if (!result.ok) throw new Error(result.error ?? 'שגיאה בשירות Google Sheets.');
    return result.data as T;
  }
  load(): Promise<Store> { return this.request<Store>('load'); }
  save(store: Store): Promise<void> { return this.request<void>('saveStore', store); }
  addEvent(event: InventoryEvent): Promise<Store> { return this.request<Store>('addEvent', event); }
  reset(): Promise<Store> { return this.request<Store>('reset'); }
}
