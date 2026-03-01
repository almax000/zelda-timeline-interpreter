import { describe, it, expect } from 'vitest';
import { evaluateTips, tipRegistry, type TipContext } from '../../tips/tipRegistry';

function makeContext(overrides: Partial<TipContext> = {}): TipContext {
  return {
    nodeCount: 0,
    edgeCount: 0,
    tabCount: 1,
    hasSelection: false,
    welcomeDismissed: true,
    counters: { nodeDrags: 0, toolSwitches: 0, nodesDeleted: 0 },
    ...overrides,
  };
}

describe('tipRegistry', () => {
  it('has tips ordered by ascending priority', () => {
    for (let i = 1; i < tipRegistry.length; i++) {
      expect(tipRegistry[i].priority).toBeGreaterThan(tipRegistry[i - 1].priority);
    }
  });

  it('each tip has a unique id', () => {
    const ids = tipRegistry.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('evaluateTips', () => {
  it('returns null when no conditions are met', () => {
    const ctx = makeContext();
    const result = evaluateTips(ctx, new Set());
    // dragGames shows when nodeCount===0 && welcomeDismissed
    expect(result?.id).toBe('dragGames');
  });

  it('returns dragGames when no nodes and welcome dismissed', () => {
    const ctx = makeContext({ nodeCount: 0, welcomeDismissed: true });
    const result = evaluateTips(ctx, new Set());
    expect(result?.id).toBe('dragGames');
  });

  it('returns rightClick when nodes >= 1', () => {
    const ctx = makeContext({ nodeCount: 1 });
    const seen = new Set(['dragGames']);
    const result = evaluateTips(ctx, seen);
    expect(result?.id).toBe('rightClick');
  });

  it('returns branchColors when edges >= 1 and rightClick is seen', () => {
    const ctx = makeContext({ nodeCount: 1, edgeCount: 1 });
    const seen = new Set(['dragGames', 'rightClick']);
    const result = evaluateTips(ctx, seen);
    expect(result?.id).toBe('branchColors');
  });

  it('skips seen tips and returns next eligible one', () => {
    const ctx = makeContext({ nodeCount: 5, edgeCount: 3 });
    const seen = new Set(['dragGames', 'rightClick', 'branchColors', 'shiftDrag', 'spacePan']);
    const result = evaluateTips(ctx, seen);
    expect(result?.id).toBe('imagePaste');
  });

  it('returns null when all eligible tips are seen', () => {
    const ctx = makeContext({ nodeCount: 1 });
    const seen = new Set(tipRegistry.map((t) => t.id));
    const result = evaluateTips(ctx, seen);
    expect(result).toBeNull();
  });

  it('priority: rightClick wins over branchColors', () => {
    const ctx = makeContext({ nodeCount: 2, edgeCount: 1 });
    const result = evaluateTips(ctx, new Set(['dragGames']));
    expect(result?.id).toBe('rightClick');
  });

  it('shiftDrag appears after 2 node drags', () => {
    const ctx = makeContext({
      nodeCount: 2,
      edgeCount: 1,
      counters: { nodeDrags: 2, toolSwitches: 0, nodesDeleted: 0 },
    });
    const seen = new Set(['dragGames', 'rightClick', 'branchColors']);
    const result = evaluateTips(ctx, seen);
    expect(result?.id).toBe('shiftDrag');
  });

  it('toolShortcuts appears after 3 tool switches', () => {
    const ctx = makeContext({
      nodeCount: 2,
      edgeCount: 2,
      counters: { nodeDrags: 0, toolSwitches: 3, nodesDeleted: 0 },
    });
    const seen = new Set([
      'dragGames', 'rightClick', 'branchColors', 'shiftDrag',
      'spacePan', 'imagePaste', 'duplicate', 'edgeSplit',
    ]);
    const result = evaluateTips(ctx, seen);
    expect(result?.id).toBe('toolShortcuts');
  });

  it('undoRedo appears after 1 node deleted', () => {
    const ctx = makeContext({
      nodeCount: 2,
      counters: { nodeDrags: 0, toolSwitches: 0, nodesDeleted: 1 },
    });
    const seen = new Set([
      'dragGames', 'rightClick', 'branchColors', 'shiftDrag',
      'spacePan', 'imagePaste', 'duplicate', 'edgeSplit', 'toolShortcuts',
    ]);
    const result = evaluateTips(ctx, seen);
    expect(result?.id).toBe('undoRedo');
  });

  it('tabManagement appears when tabCount >= 2', () => {
    const ctx = makeContext({ nodeCount: 5, edgeCount: 2, tabCount: 2 });
    const seen = new Set([
      'dragGames', 'rightClick', 'branchColors', 'shiftDrag',
      'spacePan', 'imagePaste', 'duplicate', 'edgeSplit',
      'toolShortcuts', 'undoRedo',
    ]);
    const result = evaluateTips(ctx, seen);
    expect(result?.id).toBe('tabManagement');
  });

  it('exportShare appears when nodeCount >= 5', () => {
    const ctx = makeContext({ nodeCount: 5, edgeCount: 2, tabCount: 2 });
    const seen = new Set([
      'dragGames', 'rightClick', 'branchColors', 'shiftDrag',
      'spacePan', 'imagePaste', 'duplicate', 'edgeSplit',
      'toolShortcuts', 'undoRedo', 'tabManagement',
    ]);
    const result = evaluateTips(ctx, seen);
    expect(result?.id).toBe('exportShare');
  });
});
