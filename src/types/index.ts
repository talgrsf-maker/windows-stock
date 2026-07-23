export type Role = 'viewer' | 'bending_manager' | 'windows_manager' | 'admin';
export type ItemType = 'product' | 'component';
export type EventType = 'component_production' | 'window_production' | 'window_dispatch' | 'inventory_adjustment' | 'inventory_count' | 'event_reversal';
export interface Product { id: string; name: string; targetQuantity: number; active: boolean; }
export interface Component { id: string; name: string; responsibility: 'bending'|'assembly'|'warehouse'|'other'; active: boolean; workTimeSeconds?: number; displayOrder: number; }
export interface BomLine { productId: string; componentId: string; quantity: number; }
export interface InventoryLine { itemType: ItemType; itemId: string; quantity: number; }
export interface InventoryEvent { id: string; createdAt: string; createdBy: string; userRole: Role; eventType: EventType; itemType: ItemType; itemId: string; quantity: number; note?: string; relatedEventId?: string; bomSnapshot?: BomLine[]; baselineId?: string; negativeStockApproved?: boolean; lines: InventoryLine[]; }
export interface Baseline { id: string; createdAt: string; note: string; lines: InventoryLine[]; }
export interface User { id: string; email: string; name: string; role: Role; }
export interface Store { products: Product[]; components: Component[]; bom: BomLine[]; events: InventoryEvent[]; baselines: Baseline[]; users: User[]; }
