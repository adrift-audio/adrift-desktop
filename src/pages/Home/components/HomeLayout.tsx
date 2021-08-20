import React, { memo } from 'react';

import Cog from '../../../assets/cog.svg';
import DarkWave from '../../../assets/wave-dark.svg';
import DropZone from './DropZone';
import { ProcessedFile, User } from '../../../@types/models';
import SettingsModal from './SettingsModal';

interface HomeLayoutProps {
  dragging: boolean;
  files: ProcessedFile[];
  handleContextClick: (id: string) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => Promise<void | null>;
  handleLogout: () => void;
  handleRemoveAll: () => void;
  handleSettingsModal: () => void;
  loading: boolean;
  setDragging: (value: boolean) => void;
  settingsModal: boolean;
  user: User | null;
}

function HomeLayout(props: HomeLayoutProps): React.ReactElement {
  const {
    dragging,
    files,
    handleContextClick,
    handleDrop,
    handleLogout,
    handleRemoveAll,
    handleSettingsModal,
    loading,
    setDragging,
    settingsModal,
    user,
  } = props;

  return (
    <div className="flex direction-column home fade-in">
      { settingsModal && (
        <SettingsModal
          handleLogout={handleLogout}
          handleRemoveAll={handleRemoveAll}
          handleSettingsModal={handleSettingsModal}
          user={user || null}
        />
      ) }
      <div className="flex justify-content-between align-items-center header noselect">
        <button
          className="flex justify-content-between align-items-center header-icon-button"
          type="button"
        >
          <img
            alt="Adrift"
            className="header-icon"
            src={DarkWave}
          />
        </button>
        <div className="flex align-items-center">
          <span className="mr-1">
            { !user && 'Loading...' }
            { user && `${user.firstName} ${user.lastName}`}
          </span>
          <button
            className="flex justify-content-between align-items-center header-icon-button"
            onClick={handleSettingsModal}
            type="button"
          >
            <img
              alt="Settings"
              className="header-icon"
              src={Cog}
            />
          </button>
        </div>
      </div>
      <DropZone
        dragging={dragging}
        files={files}
        handleContextClick={handleContextClick}
        handleDragging={setDragging}
        handleDrop={handleDrop}
        loading={loading}
      />
    </div>
  );
}

export default memo(HomeLayout);
