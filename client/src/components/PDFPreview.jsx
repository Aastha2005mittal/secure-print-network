import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PDFPreview({ file }) {
  const [numPages, setNumPages] = useState(null);

  function onLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">PDF Preview</h2>

      <Document file={file} onLoadSuccess={onLoadSuccess}>
        {numPages &&
          Array.from(new Array(numPages), (_, index) => (
            <Page key={index} pageNumber={index + 1} />
          ))}
      </Document>
    </div>
  );
}

export default PDFPreview;