import React, { memo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import DarkWave from '../../assets/wave-dark.svg';
import { getData } from '../../utilities/data-service';
import { ROUTES } from '../../constants';
import { Token, User } from '../../@types/models';
import './index.scss';

function Index(): React.ReactElement {
  const router = useHistory();

  useEffect(
    () => {
      const token = getData<Token>('token');
      const user = getData<User>('user');
      const timer = setTimeout(
        () => router.replace(`/${token && user ? ROUTES.home : ROUTES.signIn}`),
        2000,
      );

      return () => clearTimeout(timer);
    },
    [router],
  );
  return (
    <div className="app-title noselect">
      <div className="title">
        ADRIFT
      </div>
      <div className="wave-logo noselect">
        <img
          alt="Adrift"
          className="wave-logo noselect"
          src={DarkWave}
        />
      </div>
    </div>
  );
}

export default memo(Index);
