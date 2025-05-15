import { useState } from "react";

export default function App() {
  const [fileNames, setFileNames] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState([]);

  const handleFileUpload = async () => {
    setFileNames([]);
    setUploadFailed(false);
    setUploading(true);

    if (selectedFiles.length === 0) {
      setUploading(false);
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setUploading(false);
        setUploadFailed(false);
        setFileNames(selectedFiles.map((f) => f.name));
      } else {
        setUploading(false);
        setUploadFailed(true);
      }
    } catch (error) {
      setUploading(false);
      setUploadFailed(true);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;
    if (fileNames.length === 0) return;

    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ question }),
    });
    const data = await res.json();
    console.log(data);
    setAnswer(data.answer);
    setHistory(prev => [...prev, { question, answer: data.answer }]);
    setLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-50 to-sky-100 p-6 font-sans text-gray-900 flex flex-col md:flex-row gap-6">
      {/* Left Panel */}
      <div className="md:w-1/3 w-full max-w-sm bg-white shadow-2xl rounded-3xl p-6 flex flex-col space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">Document Memory</h2>
          <div
            role="button"
            aria-label="Upload files"
            tabIndex={0}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
                file.type === "application/pdf"
              );
              setSelectedFiles((prev) => {
                const allFiles = [...prev, ...droppedFiles];
                const unique = allFiles.filter(
                  (file, index, self) => self.findIndex(f => f.name === file.name) === index
                );
                return unique;
              });
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onClick={() => document.getElementById("file-upload").click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById("file-upload").click();
              }
            }}
            className={`w-full border-2 border-dashed rounded-xl p-4 text-center text-indigo-600 text-sm cursor-pointer transition ${
              isDragging ? 'bg-indigo-100 border-indigo-400' : 'border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            📄 Drag & drop PDF files here or click to select
            <input
              id="file-upload"
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) =>
                setSelectedFiles((prev) => {
                  const newFiles = Array.from(e.target.files);
                  const allFiles = [...prev, ...newFiles];
                  const unique = allFiles.filter(
                    (file, index, self) => self.findIndex(f => f.name === file.name) === index
                  );
                  return unique;
                })
              }
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="relative border border-indigo-200 rounded-xl p-3 text-sm bg-white shadow-sm hover:shadow-md transition"
            >
              <button
                onClick={() => handleRemoveFile(index)}
                className="absolute top-1 right-2 text-gray-400 hover:text-red-500 text-xs"
                aria-label="Remove file"
              >
                ×
              </button>
              <div className="font-semibold text-gray-800 truncate">{file.name}</div>
              <div className="text-gray-500 text-xs mt-1">
                {uploading
                  ? "Uploading..."
                  : uploadFailed
                  ? "Error uploading"
                  : fileNames.includes(file.name)
                  ? "✅ Uploaded"
                  : "Ready"}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleFileUpload}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={uploading || selectedFiles.length === 0}
        >
          {uploading ? "Uploading..." : "Set Memory"}
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col h-full shadow-2xl bg-white rounded-2xl">
        {/* Main Right Panel */}
        <div className="bg-white rounded-3xl rounded-br-none rounded-bl-none p-8 space-y-6">
          <h1 className="text-3xl font-extrabold text-indigo-600 tracking-tight">
            DeepDoc <span className="text-gray-500 text-xl">AI Document Assistant</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Ask a Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 border border-indigo-200 bg-indigo-50 rounded-lg text-sm text-gray-900"
                placeholder="e.g., What are the main findings of the paper?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || selectedFiles.length==0}
            >
              {loading ? "Thinking..." : "Get Answer"}
            </button>
          </form>
        </div>
        <div className="bg-white rounded-3xl rounded-tl-none rounded-tr-none pb-8 pl-8 pr-8 space-y-6 overflow-y-auto">
          <label className="block mb-2 text-sm font-medium text-gray-600">Answer:</label>
          <p className="w-full p-3 border border-indigo-200 bg-indigo-50 rounded-lg text-sm text-gray-900 whitespace-pre-wrap">
            {answer || "The AI’s response will appear here."}
          </p>
        </div>
      </div>

      {/* History Panel */}
      <div className="md:w-1/3 w-full max-w-sm bg-white shadow-2xl rounded-3xl p-6 flex flex-col space-y-4 h-full overflow-hidden">
        <h2 className="text-lg font-bold text-gray-700 mb-2">History</h2>
        <div className="overflow-y-auto flex-1 space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No questions asked yet.</p>
          ) : (
            [...history].reverse().map((item, idx) => (
              <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 shadow-sm space-y-1">
                <p className="text-sm font-semibold text-indigo-700">Q: {item.question}</p>
                <p className="text-sm text-gray-700">A: {item.answer}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
