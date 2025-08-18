module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageReporters: ["json", "lcov", "text", "clover"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
  coveragePathIgnorePatterns: ["<rootDir>/spec/"],
  setupFilesAfterEnv: ['jest-extended/all'],
};