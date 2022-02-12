/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/pipeline/generator.ts', 'src/pipeline/parser.ts'],
  testPathIgnorePatterns: ['__tests__/output', '__tests__/schema', '__tests__/.fstconfig.js']
};