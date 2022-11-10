export interface EnvironmentVar {
  name:
    | 'AWS_REGION'
    | 'SECURE_DOWNLOAD_TABLE_NAME'
    | 'LINK_EXPIRY_TIME'
    | 'QUERY_RESULTS_BUCKET_NAME'
    | 'ATHENA_OUTPUT_BUCKET_NAME'
}
