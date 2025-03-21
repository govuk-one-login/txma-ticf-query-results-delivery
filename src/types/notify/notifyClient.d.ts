declare module 'notifications-node-client' {
  interface Options {
    personalisation: import('./personalisationOptions')
    reference: string
  }
  export class NotifyClient {
    constructor(url: string, apiKey: string)
    constructor(apiKey: string)
    sendEmail(
      templateId: string,
      emailAddress: string,
      options: Options
    ): import('./customAxiosResponse')
  }
}
