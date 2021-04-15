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
