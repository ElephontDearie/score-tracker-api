/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ["<rootDir>"],
  moduleFileExtensions: ["ts", "js", "json"],
  testRegex: "_test.ts",
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/lib/__tests__/types"]
  
};