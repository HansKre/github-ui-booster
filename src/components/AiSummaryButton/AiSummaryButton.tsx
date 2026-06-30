import React, { useState } from "react";

type Props = {
  onClick: () => Promise<void>;
};

export const AiSummaryButton: React.FC<Props> = ({ onClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setIsLoading(true);
    setError(null);
    onClick()
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <button
      data-testid="AiSummaryButton"
      type="button"
      className="Button--secondary Button--medium Button"
      disabled={isLoading}
      onClick={handleClick}
      title={error ?? "Generate AI Summary"}
    >
      <span className="Button-content">
        <span className="Button-label">
          {isLoading ? "Generating..." : error ? "AI Summary ❌" : "AI Summary"}
        </span>
      </span>
    </button>
  );
};
