"use client";
import Image from "next/image";
import { useState } from "react";

export default function StickerUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [labels, setLabels] = useState<string[] | null>(null); // To hold multiple labels
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ fileName: string; fileSize: number; label: string; timestamp: string }[]>([]);

  // State to store error messages
  const [error, setError] = useState<string | null>(null);

  // To store the image URL for preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      // Generate a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a sticker!");

    setLoading(true);
    setError(null); // Reset the error state on each upload attempt

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/classify", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result); // Debugging: Check server response

        // Generate multiple labels (for example, ["pick", "plectrum", "lectron"])
        const generatedLabels = ["pick", "plectrum", "lectron"];

        // Set labels to the array
        setLabels(generatedLabels);

        // Storing the history
        const newHistory = {
          fileName: file.name,
          fileSize: file.size,
          label: generatedLabels.join(", "), // Join labels into a single string for display
          timestamp: new Date().toLocaleString(),
        };
        setHistory([newHistory, ...history]); // Add the new item to the history
      } else {
        const result = await response.json();
        console.error("Server error:", result);
        setError(result.message || "Failed to upload.");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      setError("Error occurred while uploading.");
    }
    setLoading(false);
  };

  const handleCopy = (data: string) => {
    navigator.clipboard.writeText(data);
    alert("Copied to clipboard!");
  };

  // Handle saving the image with label as the filename
  const handleSave = () => {
    if (!file || !labels) return;

    const link = document.createElement("a");
    link.href = imagePreview || "";
    link.download = `${labels.join('_')}.png`; // Using labels joined as the filename for download
    link.click();
  };

  return (
    <>
      {/* Styled file upload box */}
      <div className="border-2 border-dashed border-gray-300 p-6 w-full max-w-lg rounded-lg flex justify-center items-center cursor-pointer hover:bg-gray-800 bg-gray-100 transition">
        <input
          placeholder="Click or Drag to Upload Image"
          title=""
          type="file"
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
          className="opacity-0 absolute w-full h-full cursor-pointer"
        />
        <p className="text-gray-700">Click or Drag to Upload Image</p>
      </div>
      <div className="flex flex-col items-center p-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-2xl shadow-lg max-w-lg mx-auto mt-10">
        <h2 className="text-white text-xl font-semibold mb-4 animate__animated animate__fadeInUp">Upload Your Sticker</h2>
        <div className="flex flex-col items-center space-y-4">
          {/* Image preview and classify button */}
          {imagePreview && (
            <div className="flex items-center mt-6 space-x-4 w-full">
              <div className="w-1/2">
                <Image
                  height={300}
                  width={300}
                  src={imagePreview}
                  alt="Image Preview"
                  className="bg-gray-500 object-cover rounded-lg shadow-md"
                />
              </div>

              <div className="w-1/2 text-center">
                <button
                  className={`${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    } text-white px-6 py-3 rounded-lg transition duration-300 transform hover:scale-105`}
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Classify Sticker"}
                </button>
              </div>
            </div>
          )}

          {labels && labels.length > 0 && (
            <div className="mt-4 text-center">
              <div className="flex flex-col items-center">
                <p className="text-white text-lg font-medium mb-2">Sticker Labels:</p>

                {/* Table for displaying the labels */}
                <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">No.</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Title</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Copy</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labels.map((label, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{label}</td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                            onClick={() => handleCopy(label)}
                          >
                            Copy
                          </button>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            onClick={handleSave}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Display the error message if any */}
          {error && (
            <div className="mt-4 text-center bg-white rounded-lg p-1 text-red-500">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Display the history of uploaded items */}
          {history.length > 0 && (
            <div className="mt-6 w-full bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload History</h3>
              {history.map((entry, index) => (
                <div key={index} className="flex justify-between items-center mb-4 p-4 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-lg">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-700">File: {entry.fileName}</p>
                    <p className="text-gray-600">Size: {Math.round(entry.fileSize / 1024)} KB</p>
                    <p className="text-gray-600">Label: {entry.label}</p>
                    <p className="text-gray-500 text-xs">Uploaded at: {entry.timestamp}</p>
                  </div>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    onClick={() => handleCopy(`${entry.fileName}, Label: ${entry.label}`)}
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
  