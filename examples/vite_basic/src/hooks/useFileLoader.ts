import { useState, useEffect } from "react";
import { AVAILABLE_FILES } from "../constants/files";
import type { FileOption } from "../constants/files";

const STORAGE_KEY = "jsondoc-selected-file";

export const useFileLoader = (initialFile: FileOption) => {
  // Get saved file from localStorage or use initial file
  const getSavedFile = (): FileOption => {
    try {
      const savedPath = localStorage.getItem(STORAGE_KEY);
      if (savedPath) {
        // Find the file option that matches the saved path
        const savedFile = AVAILABLE_FILES.find(
          (file: FileOption) => file.path === savedPath
        );
        if (savedFile) {
          return savedFile;
        }
      }
    } catch (error) {
      console.warn("Failed to read from localStorage:", error);
    }
    return initialFile;
  };

  const [selectedFile, setSelectedFile] = useState<FileOption>(getSavedFile);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (filePath: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      console.error("Error loading JSON:", err);
      setError(err instanceof Error ? err.message : "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file: FileOption) => {
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, file.path);
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }

    setSelectedFile(file);

    // Reload the page
    window.location.reload();
  };

  useEffect(() => {
    loadData(selectedFile.path);
  }, [selectedFile]);

  return {
    selectedFile,
    data,
    loading,
    error,
    handleFileChange,
  };
};
