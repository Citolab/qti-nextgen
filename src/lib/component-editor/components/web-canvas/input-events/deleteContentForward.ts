import { IInputEvent } from '.';
import { deleteContentsLikeWord } from '../../utilities';

// https://github.com/w3c/input-events/issues/82

export const deleteContentForward: IInputEvent<string> = async (elMap, range, data): Promise<StaticRange | null> => {
  return await deleteContentsLikeWord(range);
  return null;
};
