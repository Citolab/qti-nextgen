// https://d-toybox.com/studio/lib/input_event_viewer.html

import { MyModuleInterface } from '../../../src/types';

/*
  _                   _                          _
 (_)                 | |                        | |
  _ _ __  _ __  _   _| |_    _____   _____ _ __ | |_ ___
 | | '_ \| '_ \| | | | __|  / _ \ \ / / _ \ '_ \| __/ __|
 | | | | | |_) | |_| | |_  |  __/\ V /  __/ | | | |_\__ \
 |_|_| |_| .__/ \__,_|\__|  \___| \_/ \___|_| |_|\__|___/
         | |
         |_|
*/

export * from './deleteContentBackward';
export * from './deleteContentForward';
export * from './insertParagraph';
export * from './insertText';
export * from './insertFromPaste';

// pk: checks if an el has a hook for the event and executes it
function preHook(event: string, elMap, range, data) {
  let cp: StaticRange = range;
  const elName = range.commonAncestorContainer.parentElement.localName;
  if (elMap.get(elName) && elMap.get(elName)[event]) {
    cp = elMap.get(elName)[event](range, data);
    if (cp != null) return cp;
  }
  return cp;
}

export interface IInputEvent<T extends string | DataTransfer> {
  (elMap: Map<string, MyModuleInterface> | null, xmlRange: Range, data?: T): Promise<StaticRange>;
}
