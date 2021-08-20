/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
exports.default = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testPathIgnorePatterns: ["dist"],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
};