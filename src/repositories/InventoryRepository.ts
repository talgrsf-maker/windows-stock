import type { InventoryEvent, Store } from '../types';
export interface InventoryRepository { load(): Promise<Store>; save(store: Store): Promise<void>; addEvent(event: InventoryEvent): Promise<Store>; reset(): Promise<Store>; }
