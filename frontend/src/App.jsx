import { useState } from "react";

export default function App() {
  const [fileName, setFileName] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);

  const handleFileUpload = async (e) => {
    setFileName("")
    setUploadFailed(false)
    setUploading(true);

    const file = e.target.files[0];
    if (!file) {
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setUploading(false);
        setUploadFailed(false);
        setFileName(file.name);
      } else {
        setUploading(false);
        setUploadFailed(true);
      }
    } catch (error) {
      setUploading(false);
      setUploadFailed(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;
    if (!fileName) return;

    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ question }),
    });
    const data = await res.json();
    console.log(data);
    setAnswer(data.answer);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-3xl p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 tracking-tight">
          DeepDoc{" "}
          <span className="text-gray-500 text-xl">AI Document Assistant</span>
        </h1>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-600">
            Upload a PDF
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full p-2 border border-indigo-200 bg-indigo-50 rounded-lg text-sm hover:cursor-pointer"
          />
          {fileName && (
            <p className="mt-2 text-sm text-emerald-600 font-medium">
              Uploaded: {fileName}
            </p>
          )}
          {uploadFailed && (
            <p className="mt-2 text-sm text-red-600 font-medium">
              Error uploading file
            </p>
          )}
          {uploading && (
            <p className="mt-2 text-sm text-blue-600 font-medium">
              Uploading...
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Ask a Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 border border-sky-200 bg-sky-50 rounded-lg text-sm"
              placeholder="e.g., What are the main findings of the paper?"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:cursor-pointer hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            disabled={loading}
          >
            {loading ? "Thinking..." : "Get Answer"}
          </button>
        </form>

        <div className="p-4 bg-sky-50 border border-indigo-100 rounded-xl min-h-[100px]">
          <h2 className="text-sm font-semibold text-gray-500 mb-1">Answer:</h2>
          <p className="text-gray-800 whitespace-pre-wrap">
            {answer || "The AI’s response will appear here."}
          </p>
        </div>
      </div>
    </div>
  );
}
