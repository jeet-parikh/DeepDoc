import { useState } from "react";

export default function App() {
  const [fileNames, setFileNames] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);

  const handleFileUpload = async () => {
    setFileNames([])
    setUploadFailed(false)
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
        setFileNames(selectedFiles.map(f => f.name));
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
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-100 flex p-6 font-sans">
      {/* Left Panel */}
      <div className="w-1/3 max-w-xs bg-white shadow-xl rounded-3xl p-6 space-y-4 mr-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-700">Add Files</h2>
            <label htmlFor="file-upload" className="cursor-pointer">
              📄➕
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => setSelectedFiles(selectedFiles.concat(Array.from(e.target.files)))}
            />
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="border rounded-lg p-2 text-sm bg-indigo-50">
                <div className="font-semibold text-gray-800">{file.name}</div>
                <div className="text-gray-600">
                  {uploading ? "Uploading..." : uploadFailed ? "Error uploading" : fileNames.includes(file.name) ? "Successfully uploaded" : "Ready"}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleFileUpload}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition mt-4"
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? "Uploading..." : "Set Memory"}
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white shadow-xl rounded-3xl p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">
          DeepDoc <span className="text-gray-500 text-xl">AI Document Assistant</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Ask a Question</label>
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
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
