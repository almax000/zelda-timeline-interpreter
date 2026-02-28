import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '../constants';

export interface InteractionCounters {
  nodeDrags: number;
  toolSwitches: number;
  nodesDeleted: number;
}

const DEFAULTS: InteractionCounters = { nodeDrags: 0, toolSwitches: 0, nodesDeleted: 0 };

let counters: InteractionCounters = loadFromStorage();
const listeners = new Set<() => void>();

function loadFromStorage(): InteractionCounters {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIP_COUNTERS);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEYS.TIP_COUNTERS, JSON.stringify(counters));
}

function notify() {
  listeners.forEach((cb) => cb());
}

export function incrementCounter(key: keyof InteractionCounters) {
  counters = { ...counters, [key]: counters[key] + 1 };
  persist();
  notify();
}

export function getCounters(): InteractionCounters {
  return counters;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): InteractionCounters {
  return counters;
}

export function useCounters(): InteractionCounters {
  return useSyncExternalStore(subscribe, getSnapshot);
}
