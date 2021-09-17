import React, { memo, useRef } from 'react';

import useClickOutside from '../hooks/use-click-outside';
import './ModalWrap.scss';

interface ModalWrapProps {
  children: React.ReactChild;
  closeModal: () => void;
}

function ModalWrap(props: ModalWrapProps): React.ReactElement {
  const {
    children,
    closeModal,
  } = props;

  const backgroundRef = useRef<HTMLDivElement>(null);

  useClickOutside(backgroundRef, closeModal);

  return (
    <div className="flex align-items-center justify-content-center modal">
      <div className="background" ref={backgroundRef} />
      <div className="foreground">
        { children }
      </div>
    </div>
  );
}

export default memo(ModalWrap);
