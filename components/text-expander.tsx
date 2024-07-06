"use client";
import { useState, ReactNode, useEffect } from "react";

type CollapsedTextProps = {
  text: string;
  wordCount: number;
  userName: string | null;
};

const CollapsedText = ({ text, wordCount, userName }: CollapsedTextProps) => {
  function collapseSentence(sentence: string, count: number): string {
    const words = sentence.split(" ");
    if (words.length <= count) {
      return sentence;
    }
    const shortenedWords = words.slice(0, count);
    return `${" "}${shortenedWords.join(" ")}...`;
  }

  return (
    <div className="text-base">
      <span className="font-bold ">{`${userName}${" "}`}</span>
      {collapseSentence(text, wordCount)}
    </div>
  );
};

interface TextExpanderProps {
  children: string;
  userName: string | null;
  collapsedNumWords?: number;
  expandButtonText?: string;
  collapseButtonText?: string;
  buttonColor?: string;
  expanded?: boolean;
  addClass?: string;
}

export const TextExpander: React.FC<TextExpanderProps> = ({
  children,
  userName,
  collapsedNumWords = 10,
  expandButtonText = "show more",
  collapseButtonText = "show less",
  buttonColor,
  expanded = false,
  addClass = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const needExpansion = children.split(" ").length > collapsedNumWords;

  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  return (
    <div
      className={`font-sans ${!isExpanded && "lg:flex gap-2"} mb-2 ${addClass}`}
    >
      {isExpanded ? (
        <div>
          <span className="font-bold">{`${userName}${" "}`} </span>
          {children}
        </div>
      ) : (
        <CollapsedText
          userName={userName}
          text={children}
          wordCount={collapsedNumWords}
        />
      )}
      {needExpansion && (
        <button
          className={`${
            !buttonColor ? "text-slate-200/50" : ""
          } rounded-lg px-2`}
          style={{ color: buttonColor }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? collapseButtonText : expandButtonText}
        </button>
      )}
    </div>
  );
};
