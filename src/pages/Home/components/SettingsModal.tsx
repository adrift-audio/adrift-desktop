import React, { memo } from 'react';

import Close from '../../../assets/close.svg';
import '../Home.scss';

interface SettingsModalProps {
  handleLogout: () => void;
  handleRemoveAll: () => void;
  handleSettingsModal: () => void;
}

function SettingsModal(props: SettingsModalProps): React.ReactElement {
  const {
    handleLogout,
    handleRemoveAll,
    handleSettingsModal,
  } = props;

  return (
    <div className="flex direction-column settings noselect">
      <div className="flex justify-content-end align-items-center header">
        <button
          onClick={handleSettingsModal}
          className="flex justify-content-center align-items-center header-icon-button"
          type="button"
        >
          <img
            alt="Close"
            className="settings-icon"
            src={Close}
          />
        </button>
      </div>
      <button
        onClick={handleRemoveAll}
        type="button"
      >
        Remove all shared files
      </button>
      <button
        onClick={handleLogout}
        type="button"
      >
        Log out
      </button>
    </div>
  );
}

export default memo(SettingsModal);
