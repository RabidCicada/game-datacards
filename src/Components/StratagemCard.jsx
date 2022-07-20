import ReactMarkdown from "react-markdown";

export const StratagemCard = ({
  stratagem,
  style,
  cardStyle,
  paddingTop = "32px",
}) => {
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}
    >
      <div className={`page ${stratagem.variant || "card"}`} style={cardStyle}>
        <div className="frame">
          <div className="stratagem_header">
            <div className="stratagem_type">
              {stratagem.type.split("–")[1] || "Stratagem"}
            </div>
            <div className="stratagem_name">{stratagem.name}</div>
          </div>
          <div className="stratagem_description">
            <ReactMarkdown>{stratagem.description}</ReactMarkdown>
          </div>
          <div className="stratagem_footer">
            {stratagem.cp_cost} COMMAND POINT(S)
          </div>
        </div>
      </div>
    </div>
  );
};
