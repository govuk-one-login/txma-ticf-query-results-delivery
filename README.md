# Fraud Secure Site

This is an API Gateway, 2 AWS Lambda functions, a DynamoDB table and an S3 bucket linked together to make a simple interface for downloading secure files a maximum number of times.

## Overview of solution

- The API Gateway is the only way of accessing the files.
- There is no security on the system at all, at this time. This is intentional because it's intended to be rarely used and will be updated at some point in the future.
  - It would be relatively simple to switch the API Gateway features so that it is using some of the features such as API Keys to limit the amount of access
- The first Lambda function is an HTTP GET to:
  - Check whether the link contains a valid hash in the DynamoDB table
    - If not valid, return a 404
  - The hash is valid, so display the "here be dragons" page with a link, that is simply an HTTP POST to the current page
- The second Lambda function is to:
  - Check whether the link contains a valid hash in the DynamoDB table
    - If not valid, return a 404
  - Minus 1 from the number of downloads left for this entry in the DynamoDB table
  - Generate an S3 link that expires within 30 seconds (this should be sufficient to cope with the redirect which should not matter for API Gateway timeout of 30 seconds)
  - Send an HTTP Redirect to the user to the expiring link just generated
    - This will ensure that even if the user shares the link it cannot be downloaded unless they download it within the time above

## Logging Standards (DPT-2736)

This service follows the unified TXMA logging standard defined in [IA - DPT-2736](./IA%20-%20DPT-2736%20-%20Unifying%20logging%20standards.md).

### Shared logging library

This service uses [`@govuk-one-login/dpt-logging`](https://github.com/govuk-one-login/dpt-platform-logging) as its base logger. The package provides a pre-configured AWS Lambda Powertools logger with a custom `OneLoginLogger` formatter that produces a consistent JSON log shape across all DPT services.

The local wrapper at `common/sharedServices/logger.ts` re-exports the shared logger and adds repo-specific helpers (correlation IDs, Zendesk ID context, error normalisation).

### Key conventions

- **Static messages only** — no template literals in log statements. Variable data goes in the metadata object.
- **Handler lifecycle pattern** — every handler logs `'Handler started'` on entry and `'Handler completed'` / `'Handler failed'` on exit, including `duration` (ms) and `outcome`.
- **Correlation IDs** — each handler sets a `correlationId` (SQS message ID for queue-triggered handlers, API Gateway request ID for HTTP handlers) which is appended to all log entries for the invocation.
- **Normalised error logging** — errors are logged as structured objects `{ message, name, stack }` via the `normaliseError()` helper. The `err as Error` pattern is not used.
- **Error codes** — every error log includes an `errorCode` field from `common/constants/errorCodes.ts` for quick identification and tracking.
- **Log levels** — `DEBUG` for diagnostics, `INFO` for operational events, `WARN` for recoverable issues (e.g. 404 responses), `ERROR` for failures.

### Error codes reference

All error codes are defined in `common/constants/errorCodes.ts` with the format `TQRD_<AREA>_<NUMBER>`:

| Code               | Description                         |
| ------------------ | ----------------------------------- |
| `TQRD_DOWNLOAD_01` | Confirm download handler failure    |
| `TQRD_WARNING_01`  | Download warning handler failure    |
| `TQRD_GENERATE_01` | Generate download handler failure   |
| `TQRD_EMAIL_01`    | Send email to Notify failure        |
| `TQRD_AUDIT_01`    | Audit event send failure            |
| `TQRD_PARSE_01`    | JSON parsing error                  |
| `TQRD_RESPONSE_01` | 404 — no record found               |
| `TQRD_RESPONSE_02` | 404 — download expired or exhausted |
| `TQRD_RESPONSE_03` | 400 — invalid parameters            |

### Logger API

The local wrapper (`common/sharedServices/logger.ts`) exports:

- `initialiseLogger(context)` — wraps `@govuk-one-login/dpt-logging`'s initialiser; also clears repo-specific contextual keys
- `appendZendeskIdToLogger(zendeskId)` — add Zendesk ticket ID to all subsequent logs
- `appendCorrelationId(correlationId)` — add correlation ID to all subsequent logs
- `normaliseError(err)` — consistently extract `{ message, name, stack }` from any error
- `logger` — the pre-configured Logger instance from `@govuk-one-login/dpt-logging`

## Unit tests

To run the unit tests, use the following command:

```sh
npm run test
```

You can also view code coverage reports by running this command:

```sh
npm run test:cov
```

And then opening the `coverage/lcov-report/index.html` page in your browser.

## Integration tests

As well as the usual unit tests, we have some tests which hit the deployed Lambdas, including resources that help the tests set up the data that they need.

The environment variables needed are mainly set up from SSM parameters deployed to the query results AWS account. The rest as set up in the `global` option of the test jest config. They are:

```js
process.env.NOTIFY_MOCK_SERVER_BASE_URL =
  'The base URL for the Notify mock server set in the test jest config. Value in Audit account SSM parameters'

process.env.SECURE_DOWNLOAD_BASE_URL =
  'The base URL for secure download. Available as an SSM parameter'

process.env.SQS_OPERATIONS_FUNCTION_NAME =
  'the name of the sqs operations lambda available as an SSM parameter'

process.env.INTEGRATION_TESTS_TRIGGER_QUEUE_URL =
  'the URL for the queue that the sqs operations lambda calls. Also available as an SSM parameter'

process.env.AWS_REGION = 'eu-west-2'

process.env.STACK_NAME = 'Set as a jest global. Value in AWS Cloudformation'
```

You also need permissions to access AWS resources, which
we do by authenticating against the desired AWS account. Some options are:

- the gds cli
- running the script `assumeRole.sh` in the `txma-ticf-integration` repo
- Running the following commands:

```sh
# Assumes you have a ~/.aws/config file with this profile set up
# Using query-results-build tests the deployed code in the build environment
export AWS_PROFILE=query-results-build
aws sso login
```

To run the tests:

- run `npm run test:integration` (against your authenticated environment)

Or

- run `npm run test:integration:dev` (using environment variables from local .env file in the integration tests directory)

## Using Docker locally

To use Docker for local testing, you can follow these steps:

1. Build the Docker image:

```sh
docker build -f tests/Dockerfile -t txma-ticf-query-results-delivery-1 .
```

2. Run the Docker container with the necessary environment variables:

```sh
docker run -e TEST_ENVIRONMENT=build \
 -e AWS_PROFILE=query-results-build \
 -v ~/.aws:/root/.aws:ro \
 txma-ticf-query-results-delivery-1
```

3. Verify that the tests are passing within the container.

## Running GitHub Actions locally

It can be useful to run GitHub Actions locally, for example, the action which checks that all actions are pinned to a specific SHA. On MacOS, you can use the `act` tool to do this:

```sh
brew install act

# harden_security is the name of one of the workflows in this repo
act -j harden_security
```
