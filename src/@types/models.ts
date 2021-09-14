export interface ExtendedFile extends File {
  path: string;
}

export interface Link {
  id: string;
  link: string;
}

export interface Path {
  id: string;
  path: string;
}

export interface ExtendedWindow extends Window {
  electron: {
    handleFileAdding: (array: ProcessedFile[]) => Promise<ProcessedFile[]>;
    loadFile: (value: string) => Promise<Buffer>;
    seedFiles: (array: Path[]) => Promise<Link[]>;
  };
}

export interface ProcessedFile {
  added: number;
  duration: number | null;
  durationLoaded: boolean;
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
}

export type PlaylistEntry = Omit<ProcessedFile, 'durationLoaded' | 'path'>;

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
