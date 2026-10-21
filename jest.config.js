const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const customJestConfig = {
    // The server actions run on the server, so there is no need for a DOM.
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
    // Mirrors the `@/*` alias from tsconfig.json.
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    // Pull requests that do not add tests should not fail the build.
    passWithNoTests: true,
    collectCoverageFrom: [
        'src/app/actions/**/*.ts',
        '!src/app/actions/__tests__/**',
    ],
}

module.exports = createJestConfig(customJestConfig)
