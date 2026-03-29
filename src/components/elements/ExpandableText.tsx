import { useState } from "react";

type Props = {
  text: string;
  maxLength?: number;
  customClass?: string;
};

function getSmartTrimmedText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;

  // extend a bit to avoid awkward cuts
  const extended = text.slice(0, maxLength + 40);

  const lastSpace = extended.lastIndexOf(" ");

  if (lastSpace === -1) return text.slice(0, maxLength);

  return extended.slice(0, lastSpace);
}

export default function ExpandableText({ text, maxLength = 255, customClass }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > maxLength;
  const smartText = getSmartTrimmedText(text, maxLength);


  return (
    <p className={customClass}>
      {expanded ? text : smartText}
      {isLong && !expanded && "... "}

      {isLong && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="ml-1 text-blue-600 hover:underline"
        >
          {expanded ? "Show less" : "More"}
        </button>
      )}
    </p>
  );
}