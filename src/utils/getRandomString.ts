export const getRandomString = (): string => {
  return ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
};
