import { CLIENT_TYPES } from '../constants';

export type ClientTypes = keyof typeof CLIENT_TYPES;

export interface ClientConnectionPayload {
  client: ClientTypes;
}

export interface PlayNextPayload {
  id: string;
  issuer: ClientTypes;
  target: ClientTypes;
}

export interface RemoveFilePayload {
  id: string;
  issuer: ClientTypes;
  target: ClientTypes;
}
