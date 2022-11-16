import {
  TEST_AUDIT_DATA_REQUEST_EVENTS_QUEUE_URL,
  TEST_ATHENA_OUTPUT_BUCKET_NAME,
  TEST_AWS_REGION,
  TEST_CLOSE_TICKET_QUEUE_URL,
  TEST_FRAUD_TABLE,
  TEST_LINK_EXPIRY_TIME,
  TEST_QUERY_RESULTS_BUCKET_NAME,
  TEST_NOTIFY_API_SECRETS_ARN,
  TEST_NOTIFY_EMAIL,
  TEST_NOTIFY_NAME,
  TEST_SEND_TO_EMAIL_QUEUE_URL,
  TEST_SECURE_DOWNLOAD_LINK_BASE_URL
} from './testConstants'

process.env.SECURE_DOWNLOAD_TABLE_NAME = TEST_FRAUD_TABLE
process.env.AWS_REGION = TEST_AWS_REGION
process.env.LINK_EXPIRY_TIME = TEST_LINK_EXPIRY_TIME.toString()
process.env.AUDIT_DATA_REQUEST_EVENTS_QUEUE_URL =
  TEST_AUDIT_DATA_REQUEST_EVENTS_QUEUE_URL
process.env.QUERY_RESULTS_BUCKET_NAME = TEST_QUERY_RESULTS_BUCKET_NAME
process.env.ATHENA_OUTPUT_BUCKET_NAME = TEST_ATHENA_OUTPUT_BUCKET_NAME
process.env.NOTIFY_EMAIL = TEST_NOTIFY_EMAIL
process.env.NOTIFY_NAME = TEST_NOTIFY_NAME
process.env.CLOSE_TICKET_QUEUE_URL = TEST_CLOSE_TICKET_QUEUE_URL
process.env.NOTIFY_API_SECRETS_ARN = TEST_NOTIFY_API_SECRETS_ARN
process.env.SEND_TO_EMAIL_QUEUE_URL = TEST_SEND_TO_EMAIL_QUEUE_URL
process.env.SECURE_DOWNLOAD_LINK_BASE_URL = TEST_SECURE_DOWNLOAD_LINK_BASE_URL
