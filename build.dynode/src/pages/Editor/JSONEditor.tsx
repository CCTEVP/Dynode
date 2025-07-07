import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCreativeWithAllElementsFlat } from "../../services/retriever";
import logger from "../../services/logger";

function JsonEditor() {
  const { id: creativeId } = useParams<{ id: string }>();
  const [root, setRoot] = useState<any>(null);
  const [elements, setElements] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [jsonTexts, setJsonTexts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!creativeId) {
      logger.info("No creativeId in URL params");
      return;
    }
    fetchCreativeWithAllElementsFlat(creativeId)
      .then(({ root, elements }) => {
        logger.info("Fetched creative:", root);
        logger.info("Fetched elements:", elements);
        setRoot(root);
        setElements(elements);
        // Initialize each textarea with the element's JSON
        const initialTexts: { [key: string]: string } = {};
        elements.forEach((el) => {
          initialTexts[
            el.data._id?.$oid || el.data.identifier || el.path.join(".")
          ] = JSON.stringify(el.data, null, 2);
        });
        setJsonTexts(initialTexts);
      })
      .catch((err) => {
        logger.error("Error fetching creative:", err);
      });
  }, [creativeId]);

  const handleChange = (key: string, value: string) => {
    setJsonTexts((prev) => ({ ...prev, [key]: value }));
    try {
      JSON.parse(value);
      setErrors((prev) => ({ ...prev, [key]: null }));
    } catch {
      setErrors((prev) => ({ ...prev, [key]: "Invalid JSON" }));
    }
  };

  return (
    <div>
      <h2>JSON Editor</h2>
      {elements.map((el) => {
        const key =
          el.data._id?.$oid || el.data.identifier || el.path.join(".");
        return (
          <div key={key} style={{ marginBottom: 24 }}>
            <h4>
              {el.widgetType} ({key})
            </h4>
            <textarea
              value={jsonTexts[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={10}
              cols={60}
              style={{ fontFamily: "monospace" }}
            />
            <br />
            {errors[key] && <span style={{ color: "red" }}>{errors[key]}</span>}
          </div>
        );
      })}
    </div>
  );
}

export default JsonEditor;
