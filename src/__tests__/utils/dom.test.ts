import { describe, it, expect, afterEach } from 'vitest';
import { isInputFocused } from '../../utils/dom';

describe('isInputFocused', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns true when an INPUT is focused', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    expect(isInputFocused()).toBe(true);
  });

  it('returns true when a TEXTAREA is focused', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();
    expect(isInputFocused()).toBe(true);
  });

  it('returns true when a SELECT is focused', () => {
    const select = document.createElement('select');
    document.body.appendChild(select);
    select.focus();
    expect(isInputFocused()).toBe(true);
  });

  it('returns false when body is focused', () => {
    document.body.focus();
    expect(isInputFocused()).toBe(false);
  });

  it('returns false when a DIV is focused', () => {
    const div = document.createElement('div');
    div.tabIndex = 0;
    document.body.appendChild(div);
    div.focus();
    expect(isInputFocused()).toBe(false);
  });
});
