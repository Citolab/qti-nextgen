import { IInputEvent, insertText } from '.';

export const insertFromPaste: IInputEvent<DataTransfer> = async (elMap, range, data) => {
  let cp: StaticRange;
  // preHook('insertFromPaste', elMap, range, data);
  const { startContainer: sc, startOffset: so } = range;
  if (sc.textContent === '\u200B') {
    sc.textContent = '';
  }
  for (const pastedItem of data.items) {
    if (pastedItem.kind === 'string' && pastedItem.type === 'text/plain') {
      // wrap getAsString in a promise to make it awaitable
      const text = await new Promise<string>((resolve, reject) => {
        try {
          pastedItem.getAsString(str => {
            resolve(str);
          });
        } catch (e) {
          reject(e);
        }
      });
      cp = await insertText(elMap, range, text);
    } else {
      console.log(`pastedItem.kind ${pastedItem.kind}:${pastedItem.type} not supported yet`);
    }
  }
  return cp;
};
