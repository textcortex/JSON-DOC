// Global state for list numbering
class ListCounter {
  constructor() {
    this.counters = new Map();
  }

  getNextNumber(listId) {
    if (!this.counters.has(listId)) {
      this.counters.set(listId, 0);
    }
    this.counters.set(listId, this.counters.get(listId) + 1);
    return this.counters.get(listId);
  }

  reset(listId) {
    this.counters.delete(listId);
  }

  resetAll() {
    this.counters.clear();
  }
}

export const listCounter = new ListCounter();