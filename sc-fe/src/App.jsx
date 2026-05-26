import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [mediaList, setMediaList] = useState([]);

  // Fetch uploaded media
  const fetchMedia = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/videos"
      );

      setMediaList(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  // Run once when page loads
  useEffect(() => {
    fetchMedia();
  }, []);

  // Upload media
  const uploadMedia = async () => {

    if (!file || !title) {
      alert("Please select file and enter title");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("file", file);

    try {

      await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {

            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            );

            setProgress(percentCompleted);
          },
        }
      );

      // Reset fields
      setTitle("");
      setFile(null);
      setProgress(0);

      // Refresh uploaded media
      fetchMedia();

    } catch (error) {
      console.log(error);
      alert("Upload failed");
    }
  };

  return (

    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        ShortCinemas
      </h1>

      {/* Upload Section */}

      <div className="bg-gray-900 p-6 rounded-xl max-w-lg flex flex-col gap-4">

        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-3 rounded bg-gray-800 border border-gray-700"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="p-2"
        />

        <button
          onClick={uploadMedia}
          className="bg-red-500 hover:bg-red-600 transition px-5 py-3 rounded font-semibold"
        >
          Upload
        </button>

        {/* Progress Bar */}

        <div>

          <p className="mb-2">
            Upload Progress: {progress}%
          </p>

          <div className="w-full bg-gray-700 h-4 rounded">

            <div
              className="bg-green-500 h-4 rounded"
              style={{
                width: `${progress}%`
              }}
            />

          </div>

        </div>

      </div>

      {/* Uploaded Media Section */}

      <h2 className="text-3xl font-bold mt-16 mb-8">
        Uploaded Media
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {mediaList.map((media) => (

          <div
            key={media.id}
            className="bg-gray-900 p-4 rounded-xl"
          >

            {/* VIDEO */}

            {media.media_type === "video" ? (

              <video
                controls
                className="w-full rounded-lg"
              >
                <source
                  src={`http://127.0.0.1:8000/uploads/${media.filename}`}
                  type="video/mp4"
                />
              </video>

            ) : (

              /* IMAGE */

              <img
                src={`http://127.0.0.1:8000/uploads/${media.filename}`}
                alt={media.title}
                className="w-full rounded-lg"
              />

            )}

            <h3 className="text-xl font-semibold mt-4">
              {media.title}
            </h3>

            <p className="text-gray-400">
              Type: {media.media_type}
            </p>

            <p className="text-gray-400">
              Status: {media.status}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default App;