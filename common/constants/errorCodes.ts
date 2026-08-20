/**
 * Centralised error codes for txma-ticf-query-results-delivery.
 *
 * Format: TQRD_<AREA>_<NUMBER>
 *   TQRD = TICF Query Results Delivery
 *   AREA = functional area (e.g. DOWNLOAD, EMAIL, PARSE, AUDIT)
 *   NUMBER = sequential identifier
 *
 * These codes make issues more visible and allow them to be tracked
 * via pre-assigned documentation.
 */

// Confirm Download handler errors
export const TQRD_DOWNLOAD_01 = 'TQRD_DOWNLOAD_01' // Error while handling confirm download request
export const TQRD_DOWNLOAD_02 = 'TQRD_DOWNLOAD_02' // Download not found - no record
export const TQRD_DOWNLOAD_03 = 'TQRD_DOWNLOAD_03' // Download not found - expired or exhausted

// Download Warning handler errors
export const TQRD_WARNING_01 = 'TQRD_WARNING_01' // Error while handling download warning request
export const TQRD_WARNING_02 = 'TQRD_WARNING_02' // Download warning - invalid parameters
export const TQRD_WARNING_03 = 'TQRD_WARNING_03' // Download warning - not found (no record)
export const TQRD_WARNING_04 = 'TQRD_WARNING_04' // Download warning - not found (expired)

// Generate Download handler errors
export const TQRD_GENERATE_01 = 'TQRD_GENERATE_01' // Error while handling generate download request

// Send Email Request to Notify handler errors
export const TQRD_EMAIL_01 = 'TQRD_EMAIL_01' // Could not send request to Notify
export const TQRD_EMAIL_02 = 'TQRD_EMAIL_02' // No records found in event
export const TQRD_EMAIL_03 = 'TQRD_EMAIL_03' // Missing event body
export const TQRD_EMAIL_04 = 'TQRD_EMAIL_04' // Zendesk ticket ID missing
export const TQRD_EMAIL_05 = 'TQRD_EMAIL_05' // Required details missing

// Audit errors
export const TQRD_AUDIT_01 = 'TQRD_AUDIT_01' // Error sending audit message

// JSON parsing errors
export const TQRD_PARSE_01 = 'TQRD_PARSE_01' // Error parsing JSON

// Response errors
export const TQRD_RESPONSE_01 = 'TQRD_RESPONSE_01' // 404 - no record found
export const TQRD_RESPONSE_02 = 'TQRD_RESPONSE_02' // 404 - download expired or exhausted
export const TQRD_RESPONSE_03 = 'TQRD_RESPONSE_03' // 400 - invalid parameters
