import {
  ChangeEventHandler,
  FC,
  memo,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { getCoords, getLastMention } from '../utils';

function applyHighlights(text: string) {
  text = text.replace(/\n$/g, '\n\n');
  text = text.replace(/@[a-zA-Z0-9]+?\b/g, '<mark class="mention">$&</mark>');
  text = text.replace(/#[a-zA-Z0-9]+?\b/g, '<mark class="hashtag">$&</mark>');

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
    console.log('🚀 ~ file: Mention.tsx ~ line 57 ~ handleKeyUp ~ currentSymbol', currentSymbol);

    if (!Object.hasOwn(mutationMap, currentSymbol)) {
      return;
    }

    setCurrentSymbol(currentSymbol);
    const data = mutationMap[currentSymbol]!;

    if (data) {
      const lastMention = getLastMention(value, currentSymbol).toLowerCase();
      console.log(data, lastMention);
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
  const textAreaCoordinate = getCoords(textareaRef.current);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    const textArea = textareaRef.current;

    const handleScroll = (ev: Event) => {
      if (!backdropRef.current || !ev.currentTarget) {
        return;
      }
      backdropRef.current.scrollTop = textArea.scrollTop ?? 0;
    };

    textArea.addEventListener('scroll', handleScroll);

    return () => {
      textArea.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div ref={backdropRef} className="backdrop">
        <div dangerouslySetInnerHTML={{ __html: highlights }} className="highlights" />
      </div>

      {filteredMentionList.length > 0 && (
        <ul
          className="absolute z-30"
          style={{ left: textAreaCoordinate.x, top: textAreaCoordinate.y }}>
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
