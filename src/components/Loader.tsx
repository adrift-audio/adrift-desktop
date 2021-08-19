import React, { memo } from 'react';

import './Loader.scss';

function Loader(): React.ReactElement {
  return (
    <div className="loader" />
  );
}

export default memo(Loader);
