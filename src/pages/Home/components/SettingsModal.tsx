import React, { memo } from 'react';

import Close from '../../../assets/close.svg';
import { User } from '../../../@types/models';
import '../Home.scss';
import LinkButton from '../../../components/LinkButton';

interface SettingsModalProps {
  handleLogout: () => void;
  handleRemoveAll: () => void;
  handleSettingsModal: () => void;
  user: User | null;
}

function SettingsModal(props: SettingsModalProps): React.ReactElement {
  const {
    handleLogout,
    handleRemoveAll,
    handleSettingsModal,
    user,
  } = props;

  return (
    <div className="flex direction-column settings noselect">
      <div className="flex justify-content-between align-items-center header">
        <span>
          { user && `Logged in as ${user.firstName} ${user.lastName} (${user.email})`}
        </span>
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
      <LinkButton
        classes={['mt-16']}
        onClick={handleRemoveAll}
      >
        Remove all shared files
      </LinkButton>
      <LinkButton
        classes={['mt-16']}
        onClick={handleLogout}
      >
        Log out
      </LinkButton>
    </div>
  );
}

export default memo(SettingsModal);
