import React, { memo } from 'react';

import InputTypes from '../@types/inputs';
import './StyledInput.scss';

interface StyledInputProps {
  name: string;
  type: InputTypes;
  value: string;
}

function StyledInput(props: StyledInputProps): React.ReactElement {
  const {
    name,
    type,
    value,
  } = props;
  return (
    <input
      name={name}
      type={type}
      value={value}
    />
  );
}

export default memo(StyledInput);
