export default {
  testEnvironment: "node",
  transform: {},
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true,
  setupFiles: ["./tests/setEnv.js"]
};
