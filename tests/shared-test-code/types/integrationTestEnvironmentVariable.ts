export type IntegrationTestEnvironmentVariable = {
  name:
    | 'AWS_REGION'
    | 'SQS_OPERATIONS_FUNCTION_NAME'
    | 'INTEGRATION_TESTS_TRIGGER_QUEUE_URL'
    | 'NOTIFY_MOCK_SERVER_BASE_URL'
    | 'STACK_NAME'
    | 'SECURE_DOWNLOAD_BASE_URL'
    | 'NOTIFY_API_KEY'
    | 'EMAIL_RECIPIENT'
}
