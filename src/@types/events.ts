import { CLIENT_TYPES } from '../constants';

export type Target = keyof typeof CLIENT_TYPES;

export interface PlayNextPayload {
  id: string;
  issuer: Target;
  target: Target;
}

export interface ClientConnectionPayload {
  client: Target;
}
