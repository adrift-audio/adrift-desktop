import React, { memo } from 'react';

import ButtonTypes from '../../../@types/buttons';
import { InputTypes } from '../../../@types/inputs';
import StyledButton from '../../../components/StyledButton';
import StyledInput from '../../../components/StyledInput';
import '../SignIn.scss';

interface SignInFormProps {
  email: string;
  emailStatus: string;
  formError: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
  password: string;
  passwordStatus: string;
}

function SignInForm(props: SignInFormProps): React.ReactElement {
  const {
    email,
    emailStatus,
    formError,
    handleChange,
    handleSubmit,
    isLoading,
    password,
    passwordStatus,
  } = props;

  return (
    <form
      className="flex direction-column"
      onSubmit={handleSubmit}
    >
      <StyledInput
        classes={['mt-16']}
        disabled={isLoading}
        name="email"
        onChange={handleChange}
        placeholder="Email"
        status={emailStatus}
        type={InputTypes.email}
        value={email}
      />
      <StyledInput
        classes={['mt-16']}
        disabled={isLoading}
        name="password"
        onChange={handleChange}
        placeholder="Password"
        status={passwordStatus}
        type={InputTypes.password}
        value={password}
      />
      <div className="form-error mt-16 text-center noselect">
        { formError }
      </div>
      <StyledButton
        disabled={isLoading}
        classes={['mt-16']}
        type={ButtonTypes.submit}
      >
        SUBMIT
      </StyledButton>
    </form>
  );
}

export default memo(SignInForm);
