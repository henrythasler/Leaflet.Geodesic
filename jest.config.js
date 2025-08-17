module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageReporters: ["json", "lcov", "text", "clover"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
  coveragePathIgnorePatterns: ["<rootDir>/spec/"],
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],    
  },
  extensionsToTreatAsEsm: [".ts"],
};