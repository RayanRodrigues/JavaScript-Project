import '@testing-library/jest-dom'

// jsdom does not implement matchMedia — provide a minimal stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

const storage = new Map<string, string>()

const localStorageMock: Storage = {
  get length() {
    return storage.size
  },
  clear() {
    storage.clear()
  },
  getItem(key: string) {
    return storage.has(key) ? storage.get(key)! : null
  },
  key(index: number) {
    return Array.from(storage.keys())[index] ?? null
  },
  removeItem(key: string) {
    storage.delete(key)
  },
  setItem(key: string, value: string) {
    storage.set(key, value)
  },
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
