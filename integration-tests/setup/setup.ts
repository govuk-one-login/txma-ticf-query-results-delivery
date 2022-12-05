import { retrieveSSMParameterValue } from './retrieveSSMParameterValues'

export const readSSMParameters = () => {
  retrieveSSMParameterValue('') //TODO: what is the queue url parameter called?
}
