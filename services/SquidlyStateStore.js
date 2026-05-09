function createLocalSquidlyAPI() {
  const values = new Map();
  const listeners = new Map();

  const notify = (key, value) => {
    (listeners.get(key) ?? []).forEach((listener) => listener(value));
  };

  const set = (key, value) => {
    values.set(key, value);
    notify(key, value);
  };

  return {
    firebaseSet: set,
    firebaseSetValue: set,
    firebaseOnValue(key, listener) {
      const keyListeners = listeners.get(key) ?? [];
      keyListeners.push(listener);
      listeners.set(key, keyListeners);

      if (values.has(key)) {
        listener(values.get(key));
      }
    },
  };
}

export class SquidlyStateStore {
  constructor(squidly = globalThis.SquidlyAPI ?? createLocalSquidlyAPI()) {
    this.squidly = squidly;
  }

  onValue(key, listener) {
    this.squidly.firebaseOnValue(key, listener);
  }

  setValue(key, value) {
    if (typeof this.squidly.firebaseSetValue === "function") {
      this.squidly.firebaseSetValue(key, value);
      return;
    }

    this.squidly.firebaseSet(key, value);
  }
}
