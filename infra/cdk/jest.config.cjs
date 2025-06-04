module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  collectCoverageFrom: [
    "lambda/**/*.ts",
    "lib/**/*.ts",
    "!lambda/**/*.d.ts",
    "!lib/**/*.d.ts",
    "!lambda/**/dist/**",
    "!lambda/**/*-dist/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
};
