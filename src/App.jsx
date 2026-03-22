import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null); // Added this to store the doc for downloading
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const canvasRef = useRef(null);

  // --- 1. RENDER PDF FOR VIEWING ---
  const renderPDF = async (file, pageNum = 1) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      setPdfDoc(pdf); // Save doc so we can download it later
      setCurrentPage(pageNum);

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
    };
    reader.readAsArrayBuffer(file);
  };

  const goToPage = (pageNum) => {
    if (pdfDoc && pageNum >= 1 && pageNum <= pdfDoc.numPages) {
      renderPDF(pdfFile, pageNum);
    }
  };

  // --- 2. CONVERT AND DOWNLOAD DARK PDF ---
  const downloadDarkModePDF = async () => {
    if (!pdfDoc) return alert("Please upload a PDF first!");

    setIsProcessing(true);
    try {
      const doc = new jsPDF();
      const totalPages = pdfDoc.numPages;

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        // Invert Pixels
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          data[j] = 255 - data[j]; // R
          data[j + 1] = 255 - data[j + 1]; // G
          data[j + 2] = 255 - data[j + 2]; // B
        }
        context.putImageData(imageData, 0, 0);

        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        if (i > 1) doc.addPage();
        doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }
      doc.save("Dark-Mode-Version.pdf");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      renderPDF(file);
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  return (
    <div className="App">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🌙 DarkDoc</h1>
        <p className="text-slate-400">
          Convert your bright PDFs to eye-friendly dark mode instantly.
        </p>
      </header>

      <div className="controls-card">
        {/* Custom File Upload Styling */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6"
        />

        {pdfFile && (
          <div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="btn-toggle"
              >
                {isDarkMode ? "☀️ View Light" : "🌙 View Dark"}
              </button>

              <button
                onClick={downloadDarkModePDF}
                className="btn-download"
                disabled={isProcessing}
              >
                {isProcessing ? "⏳ Processing..." : "📥 Export Dark PDF"}
              </button>
            </div>

            {pdfDoc && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-nav"
                >
                  ← Prev
                </button>
                <span className="page-counter">
                  Page {currentPage} of {pdfDoc.numPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pdfDoc.numPages}
                  className="btn-nav"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pdf-viewer">
        <canvas
          ref={canvasRef}
          className={isDarkMode ? "dark-mode-canvas" : ""}
        ></canvas>
      </div>

      {/* Donation Section */}
      <div className="donation-section">
        <h3>💝 Support DarkDoc</h3>
        <p>
          Love using DarkDoc? Consider supporting the development with a small
          donation. Your support helps keep the app free and maintain it with
          new features!
        </p>
        <div className="qr-container">
          <img src="qrcode.jpeg" 
           alt="QR Code"  
            className="qr-image"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "flex";
            }}
          />
          <div className="qr-placeholder" style={{ display: "none" }}>
            QR Code
            <br />
            Placeholder
            <br />
            <br />
            <small>Scan to Donate</small>
          </div>
        </div>
        <p className="donation-note">
          Replace this placeholder with your actual payment QR code
        </p>
      </div>
    </div>
  );
}

export default App;
