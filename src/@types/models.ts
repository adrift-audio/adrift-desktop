export interface ExtendedFile extends File {
  path: string;
}

export interface ProcessedFile {
  added: number;
  duration: number | null;
  durationLoaded: boolean;
  id: string;
  name: string;
  path: string;
  size: number;
  torrent: string;
  torrentCreated: boolean;
  type: string;
}

export enum Roles {
  admin = 'admin',
  user = 'user',
}

export type Token = string;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles;
  signedAgreement: boolean;
  created: number;
  updated: number;
}
