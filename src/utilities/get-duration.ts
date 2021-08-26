import React from 'react';

import { ExtendedFile, PreProcessedFile } from '../@types/models';

function recursiveLoop(
  items: ExtendedFile[],
  result: PreProcessedFile[],
) {
  if (items.length === 0) {
    return result;
  }

  const [current, ...rest] = items;

  const reader = new FileReader();

  reader.onload = (loadEvent: ProgressEvent<FileReader>): void => {
    const ref = React.createRef<HTMLAudioElement>() as React.MutableRefObject<HTMLAudioElement>;
    ref.current = new Audio(String(loadEvent?.target?.result));
    ref.current.onloadedmetadata = () => recursiveLoop(
      rest,
      [
        ...result,
        {
          added: Date.now(),
          name: current.name,
          path: current.path,
          size: current.size,
          type: current.type,
        },
      ],
    );
  };
  reader.readAsDataURL(current);
}

export default function getDuration(list: ExtendedFile[]) {
  reader.onload = (loadEvent: ProgressEvent<FileReader>): void => {
    console.log('reader onload', loadEvent);
    audioRef.current = new Audio(String(loadEvent?.target?.result));
    audioRef.current.onloadedmetadata = () => {
      console.log('laoded, dura', audioRef?.current?.duration);
    };
  };
  reader.readAsDataURL(item);
}
