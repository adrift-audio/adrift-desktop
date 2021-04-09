import React, { memo } from 'react';

import { InputStatuses, InputTypes } from '../@types/inputs';
import './StyledInput.scss';

interface StyledInputProps {
  classes?: string[];
  disabled?: boolean;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  status?: InputStatuses | string;
  type: InputTypes;
  value: string;
}

function StyledInput(props: StyledInputProps): React.ReactElement {
  const {
    classes,
    disabled,
    name,
    onChange,
    placeholder,
    status,
    type,
    value,
  } = props;

  const border = (status && status !== InputStatuses.idle && status) || '';

  return (
    <input
      className={`styled-input ${border} ${(classes && classes.length > 0
        ? classes.join(' ')
        : '') || ''}`}
      disabled={disabled}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );
}

StyledInput.defaultProps = {
  classes: [],
  disabled: false,
  placeholder: '',
  status: '',
};

export default memo(StyledInput);
