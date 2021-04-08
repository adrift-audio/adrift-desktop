import React, { memo } from 'react';

import InputTypes from '../../@types/inputs';
import StyledInput from '../../components/StyledInput';

function SignIn(): React.ReactElement {
  return (
    <div>
      Sign In
      <StyledInput
        name="email"
        type={InputTypes.email}
        value="test@test"
      />
    </div>
  );
}

export default memo(SignIn);
