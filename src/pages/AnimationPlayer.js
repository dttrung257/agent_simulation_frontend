import { FolderIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useCallback, useRef } from "react";
// import { FolderOpen, Play, Pause, Settings } from "lucide-react";

const AnimationPlayer = () => {
  const [folderStreams, setFolderStreams] = useState([]); // Array of folder data
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [interval, setInterval] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const intervalRef = useRef(1000);
  const lastUpdateTime = useRef(0);
  const animationFrameId = useRef(null);

  const handleRootDirectorySelect = async () => {
    try {
      setLoading(true);
      setError("");
      const rootHandle = await window.showDirectoryPicker();
      const folderData = [];

      // Get all subdirectories
      for await (const entry of rootHandle.values()) {
        if (entry.kind === "directory") {
          const folderImages = [];

          // Scan each subdirectory for images
          async function scanDirectory(dirHandle, path = "") {
            for await (const fileEntry of dirHandle.values()) {
              if (fileEntry.kind === "file") {
                const file = await fileEntry.getFile();
                if (file.type.startsWith("image/")) {
                  folderImages.push({
                    handle: fileEntry,
                    path: path + file.name,
                    size: file.size,
                  });
                }
              } else if (fileEntry.kind === "directory") {
                await scanDirectory(fileEntry, `${path}${fileEntry.name}/`);
              }
            }
          }

          await scanDirectory(entry);

          if (folderImages.length > 0) {
            // Sort images by name
            folderImages.sort((a, b) => a.path.localeCompare(b.path));

            // Create initial URL for first image
            const firstImageUrl = await loadImage(folderImages[0].handle);

            folderData.push({
              name: entry.name,
              images: folderImages,
              currentUrl: firstImageUrl,
              nextUrl: null,
            });
          }
        }
      }

      setFolderStreams(folderData);
      setCurrentIndex(0);
      setIsPlaying(false);

      // Preload next images
      if (folderData.length > 0) {
        await preloadNextImages(folderData, 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadImage = async (handle) => {
    try {
      const file = await handle.getFile();
      return URL.createObjectURL(file);
    } catch (err) {
      console.error("Error loading image:", err);
      return null;
    }
  };

  const advanceImages = useCallback(async () => {
    if (folderStreams.length === 0) return;

    const updatedStreams = folderStreams.map((folder) => {
      if (folder.currentUrl) {
        URL.revokeObjectURL(folder.currentUrl);
      }

      return {
        ...folder,
        currentUrl: folder.nextUrl,
        nextUrl: null,
      };
    });

    setFolderStreams(updatedStreams);
    setCurrentIndex((prev) => prev + 1);
    await preloadNextImages(updatedStreams, currentIndex);
  }, [folderStreams, currentIndex]);

  const updateFrame = useCallback(
    (timestamp) => {
      if (!lastUpdateTime.current) {
        lastUpdateTime.current = timestamp;
      }

      const elapsed = timestamp - lastUpdateTime.current;

      if (elapsed >= intervalRef.current) {
        // Check if we're at the last image
        if (currentIndex >= folderStreams[0].images.length - 1) {
          setIsPlaying(false);
          cancelAnimationFrame(animationFrameId.current);
          return;
        }
        advanceImages();
        lastUpdateTime.current = timestamp;
      }

      if (isPlaying) {
        animationFrameId.current = requestAnimationFrame(updateFrame);
      }
    },
    [isPlaying, advanceImages, currentIndex, folderStreams]
  );

  const resetPresentation = useCallback(() => {
    setCurrentIndex(0);
    // Reset all streams to their first image
    const resetStreams = async () => {
      const updatedStreams = await Promise.all(
        folderStreams.map(async (folder) => {
          // Cleanup existing URLs
          if (folder.currentUrl) URL.revokeObjectURL(folder.currentUrl);
          if (folder.nextUrl) URL.revokeObjectURL(folder.nextUrl);

          // Load first image
          const firstImageUrl = await loadImage(folder.images[0].handle);
          return {
            ...folder,
            currentUrl: firstImageUrl,
            nextUrl: null,
          };
        })
      );
      setFolderStreams(updatedStreams);
      await preloadNextImages(updatedStreams, 0);
    };
    resetStreams();
  }, [folderStreams]);

  const preloadNextImages = async (streams, currentIdx) => {
    const nextIdx = currentIdx + 1;

    if (nextIdx < streams[0].images.length) {
      for (let i = 0; i < streams.length; i++) {
        if (streams[i].images[nextIdx]) {
          const nextUrl = await loadImage(streams[i].images[nextIdx].handle);
          streams[i].nextUrl = nextUrl;
        }
      }
      setFolderStreams([...streams]);
    }
  };

  useEffect(() => {
    intervalRef.current = interval;
  }, [interval]);

  useEffect(() => {
    if (isPlaying) {
      lastUpdateTime.current = 0;
      animationFrameId.current = requestAnimationFrame(updateFrame);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, updateFrame]);

  useEffect(() => {
    return () => {
      folderStreams.forEach((folder) => {
        if (folder.currentUrl) URL.revokeObjectURL(folder.currentUrl);
        if (folder.nextUrl) URL.revokeObjectURL(folder.nextUrl);
      });
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <button
          onClick={handleRootDirectorySelect}
          disabled={loading}
          className="text-white gap-2 flex disabled:bg-blue-400 disabled:cursor-not-allowed items-center hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5"
        >
          <FolderIcon className="size-5" />
          Select Root Directory
        </button>

        {folderStreams.length > 0 && (
          <>
            <button
              onClick={() => {
                // If we're at the end, reset before playing
                if (currentIndex >= folderStreams[0].images.length - 1) {
                  resetPresentation();
                }
                setIsPlaying(!isPlaying);
              }}
              className="flex items-center gap-2 py-2.5 px-5 text-md font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
            >
              {isPlaying ? (
                <PauseIcon className="size-4" />
              ) : (
                <PlayIcon className="size-4" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </button>

            <div className="flex-row items-center">
              {/* <Settings className="w-4 h-4 text-gray-500" /> */}
              <label className="block text-sm font-medium text-gray-900">
                Playback speed
              </label>

              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm ml-2 text-gray-600">{interval}ms</span>
            </div>
          </>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading && <div className="text-gray-600">Loading folders...</div>}

      {folderStreams[0] && (
        <div className="text-4xl mb-4 font-md text-center">
          Step {currentIndex + 1} of {folderStreams[0].images.length}
        </div>
      )}
      {folderStreams.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6 items-center place-content-center mx-4 my-12">
            {folderStreams.map((folder) => (
              <div key={folder.name} className="border rounded-lg p-4">
                <div className="font-medium mb-2">{folder.name}</div>
                <div className="bg-white border w-fit p-5 border-gray-300 rounded-lg shadow-x">
                  {folder.currentUrl ? (
                    <img
                      src={folder.currentUrl}
                      alt={`${folder.name} - ${currentIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      Loading...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationPlayer;
