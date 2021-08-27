import React from 'react';

const global = window as any;

export default async function getDuration(
  path: string,
  type: string,
): Promise<number> {
  const buffer = await global.electron.loadFile(path);
  const url = URL.createObjectURL(new Blob([buffer], { type }));

  const ref = React
    .createRef<HTMLAudioElement | null>() as React.MutableRefObject<HTMLAudioElement | null>;

  const promisedDuration = new Promise<number>((resolve): void => {
    ref.current = new Audio(url);
    ref.current.autoplay = false;
    ref.current.muted = true;
    ref.current.onloadedmetadata = () => resolve(Number(ref?.current?.duration));
  });

  const duration = await promisedDuration;
  ref.current = null;
  URL.revokeObjectURL(url);

  return duration;
}
