import { ChangeEventHandler, FC, memo, MouseEventHandler, useMemo, useRef, useState } from 'react';

import { getLastMention } from '../utils';

function applyHighlights(text: string) {
  text = text.replace(/\n$/g, '\n\n').replace(/[@#].+?\b/g, '<mark>$&</mark>');

  return text;
}

type MentionSymbol = '@' | '#';

type MentionEntity = {
  symbol: MentionSymbol;
  data: `${MentionSymbol}${string}`[];
};

export type MentionProps = {
  mentions: MentionEntity[];
};

type MentionMap = Partial<Record<MentionEntity['symbol'], MentionEntity['data']>>;

const Mention: FC<MentionProps> = ({ mentions }) => {
  const [mentionList, setMentionList] = useState<MentionEntity['data']>([]);
  const [value, setValue] = useState<string>('');
  const [currentSymbol, setCurrentSymbol] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const mutationMap = useMemo(
    () =>
      mentions.reduce<MentionMap>(
        (acc, item) => ({
          ...acc,
          [item.symbol]: item.data
        }),
        {}
      ),
    [mentions]
  );

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { currentTarget: target } = e;
    const { value } = target;

    const currentSymbol = value.at(-2) as MentionSymbol;

    if (!Object.hasOwn(mutationMap, currentSymbol)) {
      return;
    }

    setCurrentSymbol(currentSymbol);
    const data = mutationMap[currentSymbol]!;

    if (data) {
      const lastMention = getLastMention(value, currentSymbol).toLowerCase();
      setMentionList(data.filter((item) => item.toLowerCase().includes(lastMention)));
    }
  };

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) =>
    setValue(e.currentTarget.value);

  const handleSetMention: (mention: string) => MouseEventHandler<HTMLDivElement> =
    (mention) => (e) => {
      console.log(e);
      const lastMentionIndex = value.lastIndexOf(currentSymbol);
      const newVal = `${value.substring(0, lastMentionIndex)}${mention} `;

      setValue(newVal);

      textareaRef.current?.focus();
    };

  const filteredMentionList = useMemo(() => {
    if (!/[a-zA-Z0-9]/.test(value.at(-1) ?? '')) {
      return [];
    }

    const val = getLastMention(value, currentSymbol);

    return mentionList.filter((item) => item.toLocaleLowerCase().includes(val.toLocaleLowerCase()));
  }, [currentSymbol, mentionList, value]);

  const highlights = useMemo(() => applyHighlights(value), [value]);
  const textAreaCoordinate = textareaRef.current?.getBoundingClientRect();

  return (
    <>
      <div ref={backdropRef} className="backdrop">
        <div dangerouslySetInnerHTML={{ __html: highlights }} className="highlights"></div>
      </div>

      {filteredMentionList.length > 0 && (
        <ul
          className={`absolute z-30 right-[${textAreaCoordinate?.x}] top-[${textAreaCoordinate?.y}]`}>
          {filteredMentionList.map((mention) => (
            <li key={mention}>
              <div
                className="pointer"
                role="button"
                tabIndex={0}
                onClick={handleSetMention(mention)}
                onKeyDown={() => {
                  console.log('Button pressed');
                }}>
                {mention}
              </div>
            </li>
          ))}
        </ul>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}></textarea>
    </>
  );
};

export default memo(Mention);
