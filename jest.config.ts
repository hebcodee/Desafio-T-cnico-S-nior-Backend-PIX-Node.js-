/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {

  clearMocks: true,

  collectCoverage: true,

  coverageDirectory: "coverage",

  coverageProvider: "v8",

  preset: 'ts-jest',

  testEnvironment: 'node',

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        outDir: '.jest-ts-out',
        rootDir: '.',
      },
    }],
  },

  testMatch: ['**/tests/**/*.spec.ts'],

};

export default config;
