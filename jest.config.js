module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ["json", "lcov", "text", "clover"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
  coveragePathIgnorePatterns: ["<rootDir>/spec/"]
};