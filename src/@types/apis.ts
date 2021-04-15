import { AxiosResponse } from 'axios';

import { Token, User } from './models';

interface BasicResponse {
  datetime: number;
  info: string;
  latency: number;
  request: string;
  status: number;
}

interface SignInData extends BasicResponse {
  data: {
    token: Token;
    user: User;
  }
}

export type SignInResponse = AxiosResponse<SignInData>;
