# 🌙 DarkDoc - PDF Dark Mode Converter

**DarkDoc** is a web-based utility designed for readers and developers who prefer dark mode but often find themselves squinting at bright white PDF documents. This tool converts any PDF into a high-contrast, eye-friendly dark version for both viewing and downloading.

---

## 🚀 Key Features
- **Instant Conversion:** Upload any PDF and see it in dark mode immediately.
- **Toggle View:** Switch between original and dark mode with a single click using CSS filters.
- **Permanent Download:** Uses client-side processing to generate a new PDF with inverted colors for offline use.
- **Privacy First:** All processing happens in your browser—no files are uploaded to a server.

## 🛠️ Tech Stack
- **Framework:** React.js
- **PDF Rendering:** [PDF.js](https://mozilla.github.io/pdf.js/) (Rendering pages via HTML5 Canvas)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) (For reconstructing the inverted document)
- **Styling:** CSS3 (Invert & Hue-rotate filters)

- Here is live link -- https://snehakumari2520.github.io/DarkDoc/


