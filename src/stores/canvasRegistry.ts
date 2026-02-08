import { createCanvasStore, type CanvasStoreWithTemporal } from './canvasStoreFactory';

const storeRegistry = new Map<string, CanvasStoreWithTemporal>();

export function getCanvasStore(tabId: string): CanvasStoreWithTemporal {
  let store = storeRegistry.get(tabId);
  if (!store) {
    store = createCanvasStore(tabId);
    storeRegistry.set(tabId, store);
  }
  return store;
}

export function removeCanvasStore(tabId: string): void {
  storeRegistry.delete(tabId);
}

export function hasCanvasStore(tabId: string): boolean {
  return storeRegistry.has(tabId);
}
