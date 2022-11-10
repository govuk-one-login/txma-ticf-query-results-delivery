export interface EnvironmentVar {
  name:
    | 'AWS_REGION'
    | 'SECURE_DOWNLOAD_TABLE_NAME'
    | 'LINK_EXPIRY_TIME'
    | 'CLOSE_TICKET_QUEUE_URL'
    | 'NOTIFY_API_SECRETS_ARN'
}
