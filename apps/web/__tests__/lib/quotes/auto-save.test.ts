import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Auto-save debounce and dirty-state logic (Bug #329)
// Standalone implementation for testing auto-save behavior

const AUTO_SAVE_DELAY = 3000;

class AutoSaver {
  private timer: ReturnType<typeof setTimeout> | null = null;
  isDirty = false;
  isSaving = false;
  saveCount = 0;
  lastError: string | null = null;

  markDirty() {
    this.isDirty = true;
    this.scheduleSave();
  }

  private scheduleSave() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.save(), AUTO_SAVE_DELAY);
  }

  async save(shouldFail = false) {
    if (!this.isDirty || this.isSaving) return;
    this.isSaving = true;
    try {
      if (shouldFail) throw new Error('Save failed');
      this.saveCount++;
      this.isDirty = false;
      this.lastError = null;
    } catch (e: unknown) {
      this.lastError = (e as Error).message;
    } finally {
      this.isSaving = false;
    }
  }

  cancel() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

describe('Auto-Save Debounce and Dirty State (Bug #329)', () => {
  let saver: AutoSaver;

  beforeEach(() => {
    vi.useFakeTimers();
    saver = new AutoSaver();
  });

  afterEach(() => {
    saver.cancel();
    vi.useRealTimers();
  });

  it('auto-save triggers after debounce period', async () => {
    saver.markDirty();
    expect(saver.saveCount).toBe(0);

    vi.advanceTimersByTime(AUTO_SAVE_DELAY);
    // Let the async save resolve
    await vi.runAllTimersAsync();

    expect(saver.saveCount).toBe(1);
    expect(saver.isDirty).toBe(false);
  });

  it('rapid changes only trigger one save', async () => {
    saver.markDirty();
    vi.advanceTimersByTime(1000);
    saver.markDirty();
    vi.advanceTimersByTime(1000);
    saver.markDirty();
    vi.advanceTimersByTime(1000);

    // Only 1 second since last markDirty, not yet triggered
    expect(saver.saveCount).toBe(0);

    // Advance remaining time for the last debounce
    vi.advanceTimersByTime(AUTO_SAVE_DELAY - 1000);
    await vi.runAllTimersAsync();

    expect(saver.saveCount).toBe(1);
  });

  it('no save when document is not dirty', async () => {
    await saver.save();
    expect(saver.saveCount).toBe(0);
  });

  it('save resets dirty flag on success', async () => {
    saver.markDirty();
    expect(saver.isDirty).toBe(true);

    await saver.save();
    expect(saver.isDirty).toBe(false);
    expect(saver.saveCount).toBe(1);
  });

  it('failed save keeps dirty flag', async () => {
    saver.markDirty();
    await saver.save(true);

    expect(saver.isDirty).toBe(true);
    expect(saver.lastError).toBe('Save failed');
    expect(saver.saveCount).toBe(0);
  });

  it('auto-save is paused during manual save', async () => {
    saver.markDirty();

    // Simulate a manual save in progress
    saver.isSaving = true;
    await saver.save();

    // Should not have saved because isSaving was true
    expect(saver.saveCount).toBe(0);

    // Now finish manual save and try again
    saver.isSaving = false;
    await saver.save();

    expect(saver.saveCount).toBe(1);
  });

  it('cancel prevents pending auto-save', async () => {
    saver.markDirty();
    vi.advanceTimersByTime(1000); // Partial delay
    saver.cancel();

    vi.advanceTimersByTime(AUTO_SAVE_DELAY);
    await vi.runAllTimersAsync();

    expect(saver.saveCount).toBe(0);
    // Still dirty because save never fired
    expect(saver.isDirty).toBe(true);
  });

  it('clears error on successful save after failure', async () => {
    saver.markDirty();
    await saver.save(true);
    expect(saver.lastError).toBe('Save failed');

    // Dirty flag still set, so we can save again
    await saver.save();
    expect(saver.lastError).toBeNull();
    expect(saver.saveCount).toBe(1);
  });

  it('multiple successful save cycles increment saveCount', async () => {
    saver.markDirty();
    await saver.save();
    expect(saver.saveCount).toBe(1);

    saver.markDirty();
    await saver.save();
    expect(saver.saveCount).toBe(2);

    saver.markDirty();
    await saver.save();
    expect(saver.saveCount).toBe(3);
  });

  it('debounce restarts when markDirty called during delay', async () => {
    saver.markDirty();
    vi.advanceTimersByTime(2500); // 500ms before trigger

    // Re-mark dirty resets the debounce timer
    saver.markDirty();

    // Only advance 500ms after second markDirty -- not enough for the new 3000ms delay
    vi.advanceTimersByTime(500);
    // No async flush here, the timer hasn't fired yet
    expect(saver.saveCount).toBe(0);

    // Advance the remaining time for the second debounce to fire
    vi.advanceTimersByTime(AUTO_SAVE_DELAY - 500);
    await vi.runAllTimersAsync();

    // Should have saved exactly once from the restarted debounce
    expect(saver.saveCount).toBe(1);
  });
});
