export const CLIENT_TYPES = {
  desktop: 'desktop',
  mobile: 'mobile',
  web: 'web',
} as const;

export const CLIENT_TYPE = CLIENT_TYPES.desktop;

export const ERROR_MESSAGES = {
  accessDenied: 'Access denied!',
  invalidServerResponse: 'Invalid server response!',
  missingData: 'Missing required data!',
  pleaseProvideData: 'Please provide the necessary data!',
  providedDataIsInvalid: 'Provided data is invalid!',
  somethingWentWrong: 'Oops! Something went wrong...',
} as const;

export const ROUTES = {
  home: 'home',
  signIn: 'sign-in',
} as const;

export const SOCKET_EVENTS = {
  ADD_FILE: 'ADD_FILE',
  AVAILABLE_PLAYLIST: 'AVAILABLE_PLAYLIST',
  CLIENT_CONNECTED: 'CLIENT_CONNECTED',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'ERROR',
  PLAY_NEXT: 'PLAY_NEXT',
  REMOVE_ALL: 'REMOVE_ALL',
  REMOVE_FILE: 'REMOVE_FILE',
  SWITCH_TRACK: 'SWITCH_TRACK',
} as const;
