import React, { memo, useMemo } from 'react';

import formatDate from '../../../utilities/format-date';
import formatSize from '../../../utilities/format-size';
import ModalWrap from '../../../components/ModalWrap';
import { ProcessedFile } from '../../../@types/models';
import '../Home.scss';

interface DetailsModalProps {
  handleCloseModal: () => void;
  track: ProcessedFile;
}

function DetailsModal(props: DetailsModalProps): React.ReactElement {
  const {
    handleCloseModal,
    track,
  } = props;

  const formattedDate = useMemo(
    () => formatDate(track.added),
    [track],
  );

  const formattedSize = useMemo(
    () => formatSize(track.size),
    [track],
  );

  return (
    <ModalWrap closeModal={handleCloseModal}>
      <div className="flex direction-column justify-content-between details">
        <div className="header text-center">
          { track.name }
        </div>
        <div className="flex direction-column">
          <div className="flex justify-content-between details-row">
            <div>
              Added
            </div>
            <div>
              { formattedDate }
            </div>
          </div>
          <div className="flex justify-content-between details-row">
            <div>
              Size
            </div>
            <div>
              { formattedSize }
            </div>
          </div>
        </div>
        <div className="flex justify-content-between">
          <button type="button">
            Delete
          </button>
          <button type="button">
            Close
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

export default memo(DetailsModal);
