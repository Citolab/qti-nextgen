import { MyModuleInterface } from '@editor/content';
import { RangeXML } from '../../../src/RangeXML';
import { insertFromPaste } from './insertFromPaste';
import * as pModule from '../../../elements/p';

const map = new Map<string, MyModuleInterface>([["p", pModule]])

describe('insertFromPaste', () => {
  const addTextToTransferData = (text: string) => {
    return {
      items: [
        {
          getAsString: (callback: FunctionStringCallback) => {
            callback(text);
          },
          kind: 'string',
          type: 'text/plain'
        }
      ]
    } as unknown as DataTransfer;
  };
  it('add text - start', async () => {
    const content = `<content-item-body>
                    <p>hoi</p>
                </content-item-body>`;

    // create xmlDocument from content
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(content, 'application/xml');
    const p = xmlDocument.querySelector('p') as HTMLElement;
    const range = {
      startContainer: p.firstChild,
      startOffset: 0,
      endContainer: p.firstChild,
      endOffset: 0
    } as StaticRangeInit;

    const rangeXML = new RangeXML(range);
    const result = await insertFromPaste(map, rangeXML, addTextToTransferData('a'));
    expect(p.innerHTML).toBe('ahoi');
  });

  it('add text - end', async () => {
    const content = `<content-item-body>
                    <p>hoi</p>
                </content-item-body>`;

    // create xmlDocument from content
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(content, 'application/xml');
    const p = xmlDocument.querySelector('p') as HTMLElement;
    const range = {
      startContainer: p.firstChild,
      startOffset: p.firstChild?.textContent?.length || 0,
      endContainer: p.firstChild,
      endOffset: p.firstChild?.textContent?.length || 0
    } as StaticRangeInit;

    const rangeXML = new RangeXML(range);
    const result = await insertFromPaste(map, rangeXML, addTextToTransferData('here some pasted text'));
    expect(p.innerHTML).toBe('hoihere some pasted text');
    expect(result.startOffset).toBe(p.textContent?.length);
  });
});
