import React, { memo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ERROR_MESSAGES } from '../../constants';
import { InputStatuses } from '../../@types/inputs';
import SignInForm from './components/SignInForm';
import './SignIn.scss';

interface Data<T> {
  email: T;
  password: T;
}

function SignIn(): React.ReactElement {
  const router = useHistory();

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

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();

    const trimmedEmail = data.email ? data.email.trim() : '';
    const trimmedPassword = data.password ? data.password.trim() : '';
    if (!(trimmedEmail && trimmedPassword)) {
      setFormError(ERROR_MESSAGES.pleaseProvideData);
      return setStatuses((state) => ({
        email: !trimmedEmail ? InputStatuses.error : state.email,
        password: !trimmedPassword ? InputStatuses.error : state.password,
      }));
    }

    setIsLoading(true);
    setStatuses({
      email: InputStatuses.success,
      password: InputStatuses.success,
    });

    // TODO: get token

    // TODO: use replace instead of push
    return router.push('/home');
  };

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
    </div>
  );
}

export default memo(SignIn);
