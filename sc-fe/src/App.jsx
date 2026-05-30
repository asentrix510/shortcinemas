import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [mediaList, setMediaList] = useState([]);

  const fetchMedia = async () => {

    try {

      const response =
        await axios.get("/api/videos");

      console.log(response.data);

      setMediaList(
        response.data.videos
      );

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    fetchMedia();

  }, []);

  const uploadMedia = async () => {

    if (!file || !title) {

      alert(
        "Please enter title and select file"
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "title",
      title
    );

    formData.append(
      "file",
      file
    );

    try {

      await axios.post(
        "/api/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          },

          onUploadProgress: (
            progressEvent
          ) => {

            const percent =
              Math.round(
                (
                  progressEvent.loaded *
                  100
                ) /
                progressEvent.total
              );

            setProgress(
              percent
            );

          }
        }
      );

      setFile(null);
      setTitle("");
      setProgress(0);

      fetchMedia();

    } catch (error) {

      console.log(error);

      alert(
        "Upload failed"
      );

    }

  };

  return (

    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        ShortCinemas
      </h1>

      <div className="bg-gray-900 p-6 rounded-xl max-w-lg flex flex-col gap-4">

        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="p-3 rounded bg-gray-800"
        />

        <input
          type="file"
          onChange={(e) =>
            setFile(
              e.target.files[0]
            )
          }
        />

        <button
          onClick={uploadMedia}
          className="bg-red-500 p-3 rounded"
        >
          Upload
        </button>

        <div>

          <p>
            Upload Progress:
            {" "}
            {progress}%
          </p>

          <div className="bg-gray-700 h-4 rounded">

            <div
              className="bg-green-500 h-4 rounded"
              style={{
                width:
                  `${progress}%`
              }}
            />

          </div>

        </div>

      </div>

      <h2 className="text-3xl font-bold mt-10 mb-6">
        Uploaded Media
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {mediaList.map(
          (media) => (

            <div
              key={media.id}
              className="bg-gray-900 p-4 rounded"
            >

              {media.media_type ===
              "video" ? (

                <video
                  controls
                  className="w-full"
                >

                  <source
                    src={`/api/uploads/${media.filename}`}
                    type="video/mp4"
                  />

                </video>

              ) : (

                <img
                  src={`/api/uploads/${media.filename}`}
                  alt={media.title}
                  className="w-full"
                />

              )}

              <h3 className="mt-4 text-xl">

                {media.title}

              </h3>

              <p>
                Type:
                {" "}
                {media.media_type}
              </p>

              <p>
                Status:
                {" "}
                {media.status}
              </p>

            </div>

          )
        )}

      </div>

    </div>

  );

}

export default App;