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

As well as the usual unit tests, we have some tests which hit the deployed Lambdas, and also set up some test data so that those tests have what they need.

To get started with those, you need to create a file called `.integration.test.env` at the root, with the following contents (adjust as necessary)

```
process.env.DOWNLOAD_PAGE_BASE_URL="https://YOUR-LAMBDA-URL.amazonaws.com/default/"

process.env.DOWNLOAD_DYNAMODB_TABLE_NAME="<Dynamo DB table, look in SECURE_DOWNLOAD_TABLE_NAME env variable in lambda>"

process.env.AWS_REGION="eu-west-2"

process.env.S3_RESULTS_KEY="key of CSV PII data request results file"

process.env.S3_RESULTS_BUCKET="bucket name for location of results. This should be the bucket that the ConfirmDownloadFunction lambda has access to"
```

You also need permissions to access AWS resources, which
we do by running our script from the di-txma-ticf-integration called `assumeRole.sh` in https://github.com/alphagov/di-txma-ticf-integration/blob/main/scripts/assumeRole.sh

If you've got this repo checked out at the same level as this one, you can just run this first

```
source ../di-txma-ticf-integration/scripts/assumeRole.sh <MFA code>
```

and then run `yarn test:integration`
