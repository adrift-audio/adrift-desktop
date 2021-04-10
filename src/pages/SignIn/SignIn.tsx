import React, { memo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ButtonTypes from '../../@types/buttons';
import { ERROR_MESSAGES } from '../../constants';
import { InputStatuses, InputTypes } from '../../@types/inputs';
import StyledButton from '../../components/StyledButton';
import StyledInput from '../../components/StyledInput';
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

    setStatuses({
      email: InputStatuses.success,
      password: InputStatuses.success,
    });

    // TODO: get token

    return router.replace('/home');
  };

  return (
    <form
      className="flex direction-column justify-content-center auth-wrap"
      onSubmit={handleSubmit}
    >
      <h1 className="text-center noselect">
        SIGN IN
      </h1>
      <StyledInput
        classes={['mt-16']}
        name="email"
        onChange={handleChange}
        placeholder="Email"
        status={statuses.email}
        type={InputTypes.email}
        value={data.email}
      />
      <StyledInput
        classes={['mt-16']}
        name="password"
        onChange={handleChange}
        placeholder="Password"
        status={statuses.password}
        type={InputTypes.password}
        value={data.password}
      />
      <div className="form-error mt-16 text-center noselect">
        { formError }
      </div>
      <StyledButton
        classes={['mt-16']}
        type={ButtonTypes.submit}
      >
        SUBMIT
      </StyledButton>
    </form>
  );
}

export default memo(SignIn);
