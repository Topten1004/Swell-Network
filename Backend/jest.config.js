const { defaults } = require("jest-config");

module.exports = {
  preset: "ts-jest",
  // testEnvironment: "node",
  moduleFileExtensions: [...defaults.moduleFileExtensions],
  testPathIgnorePatterns: ["/node_modules"],
  testMatch: ["**/__tests__/*.ts?(x)"],
};
