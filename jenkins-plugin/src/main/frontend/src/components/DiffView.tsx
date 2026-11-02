interface Props {
  diff: string;
}

export function DiffView({ diff }: Props): React.ReactElement {
  const lines = diff.split('\n').slice(0, 500);
  return (
    <div className="cp-diff">
      <div className="cp-diff-head">
        <span>proposed change</span>
        <span className="cp-grow" />
        <span>{diff.split('\n').length} lines</span>
      </div>
      <pre>
        {lines.map((line, index) => {
          let className = 'cp-line';
          if (line.startsWith('+') && !line.startsWith('+++')) {
            className += ' cp-add';
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            className += ' cp-del';
          } else if (line.startsWith('@@')) {
            className += ' cp-hunk';
          }
          return (
            <span className={className} key={index}>
              {line || ' '}
            </span>
          );
        })}
      </pre>
    </div>
  );
}
