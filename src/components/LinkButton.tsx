import React, { memo } from 'react';

import { ButtonTypes } from '../@types/buttons';
import './LinkButton.scss';

interface LinkButtonProps {
  children: any;
  classes?: string[];
  disabled?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: ButtonTypes;
}

function LinkButton(props: LinkButtonProps): React.ReactElement {
  const {
    children,
    classes,
    disabled,
    onClick,
    type,
  } = props;

  return (
    <button
      className={`link-button noselect ${(classes && classes.length > 0
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

LinkButton.defaultProps = {
  classes: [],
  disabled: false,
  onClick: () => null,
  type: 'button',
};

export default memo(LinkButton);
