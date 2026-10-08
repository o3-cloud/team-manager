import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../../coverage/backend',
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 20,
      lines: 28,
      statements: 27,
    },
  },
  testEnvironment: 'node',
};

export default config;
