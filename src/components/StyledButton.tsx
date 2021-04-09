import React, { memo } from 'react';

import { ButtonTypes } from '../@types/buttons';
import './StyledButton.scss';

interface StyledButtonProps {
  children: any;
  classes?: string[];
  disabled?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: ButtonTypes;
}

function StyledButton(props: StyledButtonProps): React.ReactElement {
  const {
    children,
    classes,
    disabled,
    onClick,
    type,
  } = props;

  return (
    <button
      className={`styled-button noselect ${(classes && classes.length > 0
        ? classes.join(' ')
        : '') || ''}`}
      disabled={disabled}
      onClick={onClick}
      type={type === ButtonTypes.submit ? 'submit' : 'button'}
    >
      { children }
    </button>
  );
}

StyledButton.defaultProps = {
  classes: [],
  disabled: false,
  onClick: () => null,
  type: 'button',
};

export default memo(StyledButton);
