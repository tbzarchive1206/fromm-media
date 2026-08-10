import type { Metadata } from "next";
import archiveData from "./data/archive.generated.json";
import { FrommArchive } from "./components/FrommArchive";

export const metadata: Metadata = {
  title: "FROMM MEDIA Archive — THE BOYZ ARCHIVE",
  description: "Fan-made Fromm media gallery archive for THE BOYZ.",
};

export default function Home() {
  return <FrommArchive data={archiveData} />;
}
