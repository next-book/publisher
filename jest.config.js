/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testPathIgnorePatterns: ["dist"],
  testEnvironment: 'node',
  setupFilesAfterEnv: ["./jest.setup.ts"],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
};