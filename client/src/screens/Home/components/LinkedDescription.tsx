interface Props {
    text: string;
    onNavigate: (path: string) => void;
}

const ID_PATTERN = /\bIDs?\s+(\d+(?:\s*(?:and|,)\s*\d+)*)/g;

export default function LinkedDescription({ text, onNavigate }: Props) {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = ID_PATTERN.exec(text)) !== null) {
        if (match.index > lastIndex) {
            elements.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
        }

        const fullMatch = match[0];
        const idNums = match[1];
        const prefix = fullMatch.slice(0, fullMatch.length - idNums.length);

        elements.push(<span key={`p-${match.index}`}>{prefix}</span>);

        idNums.split(/(\d+)/g).forEach((seg, j) => {
            if (/^\d+$/.test(seg)) {
                elements.push(
                    <button
                        key={`id-${match!.index}-${j}`}
                        onClick={(e) => { e.stopPropagation(); onNavigate(`/subscription/${seg}`); }}
                        className="text-emerald-600 font-bold hover:text-emerald-700 underline underline-offset-2 decoration-emerald-300 hover:decoration-emerald-500 transition-colors cursor-pointer"
                    >
                        {seg}
                    </button>
                );
            } else {
                elements.push(<span key={`s-${match!.index}-${j}`}>{seg}</span>);
            }
        });

        lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < text.length) {
        elements.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return <span>{elements}</span>;
}
