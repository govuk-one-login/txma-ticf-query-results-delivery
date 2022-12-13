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

## Integration tests

As well as the usual unit tests, we have some tests which hit the deployed Lambdas, including resources that help the tests set up the data that they need.

The environment variables needed are mainly set up from SSM parameters deployed to the query results AWS account. The rest as set up in the `global` option of the test jest config. They are:

```
process.env.NOTIFY_MOCK_SERVER_BASE_URL="The base URL for the Notify mock server set in the test jest config. Value in Audit account SSM parameters"

process.env.SECURE_DOWNLOAD_BASE_URL="The base URL for secure download. Available as an SSM parameter"

process.env.SQS_OPERATIONS_FUNCTION_NAME="the name of the sqs operations lambda available as an SSM parameter"

process.env.INTEGRATION_TESTS_TRIGGER_QUEUE_URL="the URL for the queue that the sqs operations lambda calls. Also available as an SSM parameter"

process.env.AWS_REGION='eu-west-2'

process.env.STACK_NAME='Set as a jest global. Value in AWS Cloudformation'

```

You also need permissions to access AWS resources, which
we do by authenticating against the desired AWS account (some options are the gds cli or running the script `assumeRole.sh` in the `di-txma-ticf-integration` repo).

To run the tests:

run `yarn test:integration` (against your authenticated environment) OR
`yarn test:integration-dev` (using environment variables from local .env file in the integration tests directory)
