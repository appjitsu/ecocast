// Add TypeScript definition for the global garbage collection function
// Only available when Node.js is started with the --expose-gc flag
declare global {
  namespace NodeJS {
    interface Global {
      gc?: () => void;
    }
  }
}
