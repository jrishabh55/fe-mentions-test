export const copyStyles = (source: HTMLElement, target: HTMLElement) => {
  const style = getComputedStyle(source);
  for (let i = 0; i < style.length; i++) {
    const property = style[i];
    target.style.setProperty(property, style.getPropertyValue(property));
  }
};

export const getCoords = (textArea: HTMLTextAreaElement | null) => {
  if (!textArea) {
    return { x: 0, y: 0 };
  }

  const replica = document.createElement('div');
  copyStyles(textArea, replica);

  replica.style.width = 'auto';
  replica.style.height = 'auto';

  const span = document.createElement('span');
  replica.appendChild(span);
  const content = textArea.value.substring(0, textArea.selectionStart);

  const contentLines = content.split(/[\n\r]/g);
  const currentLine = contentLines.length;

  let replicaContent = '';

  contentLines.forEach((_, i) => {
    if (i === currentLine - 1 && i < contentLines.length) {
      replicaContent += contentLines[i];
      return;
    }
    replicaContent += '\n';
  });

  span.innerHTML = replicaContent.replace(/\n$/, '\n^A');
  document.body.appendChild(replica);
  const { offsetHeight: spanHeight, offsetWidth: spanWidth } = span;
  document.body.removeChild(replica);
  return {
    x: (spanWidth > textArea.offsetWidth ? textArea.offsetWidth : spanWidth) + textArea.offsetLeft,
    y:
      (spanHeight > textArea.offsetHeight ? textArea.offsetHeight : spanHeight) + textArea.offsetTop
  };
};

export const getLastMention = (value: string, symbol: string) => value.split(symbol).at(-1) ?? '';
