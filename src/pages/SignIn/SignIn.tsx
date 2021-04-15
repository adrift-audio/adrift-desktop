import React, { memo, useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

import { BACKEND_URL, WEB_URL } from '../../configuration';
import ButtonTypes from '../../@types/buttons';
import {
  CLIENT_TYPE,
  ERROR_MESSAGES,
  ROUTES,
} from '../../constants';
import { InputStatuses } from '../../@types/inputs';
import LinkButton from '../../components/LinkButton';
import { SignInResponse } from '../../@types/apis';
import SignInForm from './components/SignInForm';
import { getData, storeData } from '../../utilities/data-service';
import { Token, User } from '../../@types/models';
import './SignIn.scss';

interface Data<T> {
  email: T;
  password: T;
}

function SignIn(): React.ReactElement {
  const router = useHistory();

  useEffect(
    () => {
      const token = getData<Token>('token');
      const user = getData<User>('user');

      if (token && user) {
        router.replace(`/${ROUTES.home}`);
      }
    },
    [router],
  );

  const [data, setData] = useState<Data<string>>({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statuses, setStatuses] = useState<Data<string>>({
    email: InputStatuses.idle as string,
    password: InputStatuses.idle as string,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.currentTarget;
    setStatuses((state) => ({
      ...state,
      [name]: InputStatuses.idle,
    }));
    return setData((state) => ({
      ...state,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    const trimmedEmail = data.email ? data.email.trim() : '';
    const trimmedPassword = data.password ? data.password.trim() : '';
    if (!(trimmedEmail && trimmedPassword)) {
      setFormError(ERROR_MESSAGES.pleaseProvideData);
      return setStatuses((state): Data<string> => ({
        email: !trimmedEmail ? InputStatuses.error : state.email,
        password: !trimmedPassword ? InputStatuses.error : state.password,
      }));
    }

    setFormError('');
    setIsLoading(true);
    setStatuses({
      email: InputStatuses.success,
      password: InputStatuses.success,
    });

    try {
      const response: SignInResponse = await axios({
        data: {
          client: CLIENT_TYPE,
          email: trimmedEmail,
          password: trimmedPassword,
        },
        method: 'POST',
        url: `${BACKEND_URL}/api/auth/sign-in`,
      });

      setIsLoading(false);

      const { data: { data: { token, user } = {} } = {} } = response;
      if (!(token && user)) {
        return setFormError(ERROR_MESSAGES.invalidServerResponse);
      }

      storeData<Token>('token', token);
      storeData<User>('user', user);

      return router.replace(`/${ROUTES.home}`);
    } catch (error) {
      setIsLoading(false);
      setStatuses({
        email: InputStatuses.error,
        password: InputStatuses.error,
      });

      const { response: { data: errorData = {} } = {} } = error;
      if (errorData.info && errorData.status) {
        const { info, status } = errorData;
        if (info === 'INVALID_DATA' && status === 400) {
          return setFormError(ERROR_MESSAGES.providedDataIsInvalid);
        }
        if (info === 'MISSING_DATA' && status === 400) {
          return setFormError(ERROR_MESSAGES.missingData);
        }
        if (info === 'INTERNAL_SERVER_ERROR' && status === 500) {
          return setFormError(ERROR_MESSAGES.somethingWentWrong);
        }
      }

      return setFormError(ERROR_MESSAGES.accessDenied);
    }
  };

  // TODO: correct the link
  const handleAccountRecovery = () => router.push(`${WEB_URL}/account-recovery`);

  // TODO: correct the link
  const handleCreateAccount = () => router.push(`${WEB_URL}/sign-up`);

  return (
    <div className="flex direction-column justify-content-center auth-wrap">
      <h1 className="text-center noselect">
        SIGN IN
      </h1>
      <SignInForm
        email={data.email}
        emailStatus={statuses.email}
        formError={formError}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        password={data.password}
        passwordStatus={statuses.password}
      />
      <LinkButton
        classes={['mt-16']}
        disabled={isLoading}
        onClick={handleAccountRecovery}
        type={ButtonTypes.button}
      >
        Account recovery
      </LinkButton>
      <LinkButton
        classes={['mt-16']}
        disabled={isLoading}
        onClick={handleCreateAccount}
        type={ButtonTypes.button}
      >
        Create account
      </LinkButton>
    </div>
  );
}

export default memo(SignIn);
