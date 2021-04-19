import { ProcessedFile } from '../@types/models';

export default (
  existingList: ProcessedFile[],
  newList: ProcessedFile[],
): ProcessedFile[] => {
  const existingPaths = existingList.map((item: ProcessedFile): string => item.path);
  const newPaths = newList.map((item: ProcessedFile): string => item.path);
  const newFiles: ProcessedFile[] = newPaths.reduce(
    (array, item, i) => {
      if (!existingPaths.includes(item)) {
        array.push(newList[i]);
      }
      return array;
    },
    [] as ProcessedFile[],
  );

  return [...existingList, ...newFiles];
};
