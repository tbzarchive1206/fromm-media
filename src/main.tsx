import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import archiveData from "../app/data/archive.generated.json";
import { FrommArchive, type Archive } from "./FrommArchive";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FrommArchive data={archiveData as Archive} />
  </StrictMode>,
);
