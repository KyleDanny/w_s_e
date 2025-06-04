# Testing Guide for Weather Station Infrastructure

This guide covers testing for the CDK infrastructure and Lambda functions in the weather station simulation project.

## Overview

The testing suite includes:

- **CDK Infrastructure Tests**: Validate CloudFormation template generation
- **Lambda Function Tests**: Unit tests for decoder and API handlers
- **Integration Tests**: End-to-end flow testing
- **Coverage Reports**: Code coverage analysis

## Test Structure

```
infra/cdk/
├── test/
│   ├── setup.ts           # Global test configuration
│   ├── cdk.test.ts        # CDK infrastructure tests
│   └── integration.test.ts # End-to-end integration tests
├── lambda/
│   ├── decoder-handler.test.ts  # Decoder Lambda tests
│   ├── api-handler.test.ts      # API Lambda tests
│   └── decode.test.ts           # Binary decode function tests
└── jest.config.js         # Jest configuration
```

## Running Tests

### All Tests

```bash
cd infra/cdk
bun run test
```

### CDK Infrastructure Tests

Tests the CloudFormation template generation, resource creation, and configuration:

```bash
bun run test:cdk
```

### Lambda Function Tests

Tests individual Lambda handlers and utility functions:

```bash
bun run test:lambda
```

### Integration Tests

Tests the complete data flow from encoding to storage to retrieval:

```bash
bun run test:integration
```

### Watch Mode (for development)

```bash
bun run test:watch
```

### With Coverage Report

```bash
bun run test:coverage
```

### Verbose Output

```bash
bun run test:verbose
```

## Test Categories

### 1. CDK Infrastructure Tests (`test/cdk.test.ts`)

Validates that your CDK stack creates the correct AWS resources:

- ✅ DynamoDB table with proper key schema
- ✅ Lambda functions with correct runtime and configuration
- ✅ API Gateway with proper routes and CORS
- ✅ IAM permissions for DynamoDB access
- ✅ Environment variables setup
- ✅ CloudFormation output generation

### 2. Lambda Function Tests

#### Decoder Handler Tests (`lambda/decoder-handler.test.ts`)

- ✅ Base64 encoded binary data processing
- ✅ Raw binary data handling
- ✅ DynamoDB storage operations
- ✅ Error handling for invalid payloads
- ✅ Extreme weather value processing
- ✅ Device ID truncation handling

#### API Handler Tests (`lambda/api-handler.test.ts`)

- ✅ GET requests with valid device IDs
- ✅ Data retrieval and formatting
- ✅ Error handling for missing parameters
- ✅ HTTP method validation
- ✅ DynamoDB query operations
- ✅ Proper response formatting

#### Decode Function Tests (`lambda/decode.test.ts`)

- ✅ Binary weather data decoding
- ✅ Temperature/humidity precision handling
- ✅ Device ID string processing
- ✅ Boundary value testing
- ✅ Data type validation

### 3. Integration Tests (`test/integration.test.ts`)

End-to-end testing of the complete weather data pipeline:

- ✅ **Encode → Decode → Store → Retrieve**: Complete data flow
- ✅ **Multi-station support**: Multiple weather stations
- ✅ **Data integrity**: Verify data survives the complete pipeline
- ✅ **Error propagation**: Error handling across components
- ✅ **Extreme values**: Edge case handling throughout system

## Test Coverage

The test suite covers:

- **CDK Resources**: All infrastructure components
- **Lambda Handlers**: Both decoder and API functions
- **Error Scenarios**: Invalid data, missing parameters, AWS service errors
- **Edge Cases**: Extreme values, boundary conditions
- **Data Flow**: Complete encode→decode→store→retrieve pipeline

## What the Tests Validate

### Functional Requirements

- Weather data can be encoded, transmitted, decoded, and stored
- API correctly retrieves stored weather data
- Multiple weather stations are supported
- Data integrity is maintained throughout the pipeline

### Non-Functional Requirements

- Error handling is robust and informative
- Performance within Lambda timeout limits
- Security through proper IAM permissions
- Scalability through DynamoDB design

### Infrastructure Requirements

- All AWS resources are created correctly
- CORS is properly configured
- Environment variables are set
- API routes are configured correctly

## Mock Strategy

The tests use comprehensive mocking:

- **AWS SDK**: Mocked DynamoDB operations for isolated testing
- **Console Logging**: Configurable logging during tests
- **Environment Variables**: Test-specific configurations
- **External Dependencies**: Isolated component testing

## Continuous Integration

To run tests in CI/CD:

```bash
# Install dependencies
cd infra/cdk
bun install

# Run all tests with coverage
bun run test:coverage

# Check if tests pass (exit code 0 = success)
echo $?
```

## Coverage Reports

After running `bun run test:coverage`, coverage reports are generated in:

- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format for CI tools
- Terminal output with coverage summary

## Debugging Tests

For debugging failing tests:

1. **Use verbose mode**: `bun run test:verbose`
2. **Run specific test**: `bun test decoder-handler.test.ts`
3. **Enable console logs**: Uncomment logging in `test/setup.ts`
4. **Check mock calls**: Tests include mock verification

## Example Test Output

```
 PASS  test/cdk.test.ts
 PASS  lambda/decoder-handler.test.ts
 PASS  lambda/api-handler.test.ts
 PASS  lambda/decode.test.ts
 PASS  test/integration.test.ts

Test Suites: 5 passed, 5 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        3.456 s
```

## Common Issues & Solutions

### Import/Module Issues

- Ensure `jest.config.js` properly handles ES modules
- Check TypeScript configuration alignment

### Mock Issues

- Clear mocks between tests using `jest.clearAllMocks()`
- Verify mock implementation matches expected interface

### Timeout Issues

- Increase Jest timeout in `setup.ts` if needed
- Check for unresolved promises in async tests

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Descriptions**: Test names should describe the scenario
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Edge Cases**: Test boundary conditions and error scenarios
5. **Coverage**: Aim for high test coverage but focus on quality
