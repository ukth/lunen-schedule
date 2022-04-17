export const joinClassNames = (...classnames: string[]) => {
  return classnames.join(" ");
};

export const parseTimeMS = (ms: number) => {
  const hour = Math.floor(ms / (60 * 60 * 1000));
  const min = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const sec = Math.floor((ms % (60 * 1000)) / 1000);

  return { hour, min, sec };
};
