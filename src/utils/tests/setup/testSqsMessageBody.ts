import {
  ZENDESK_TICKET_ID,
  TEST_COMMENT_COPY_TEXT
} from './testConstants'

export const testSqsMessageBody = {
  zendeskId: ZENDESK_TICKET_ID,
  commentCopyText: TEST_COMMENT_COPY_TEXT
} 
