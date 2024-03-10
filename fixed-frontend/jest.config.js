module.exports = {
        moduleNameMapper: {
            '\\.(css|less)$': '<rootDir>/styleMock.js',
        },
        testEnvironment: 'jsdom',
        setupFiles: ['./jest.setup.js'],
        "jest":{
            "setupFilesAfterEnv": ["jest-canvas-mock"]
        }
};