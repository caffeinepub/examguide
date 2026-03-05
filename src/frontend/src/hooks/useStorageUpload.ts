import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

export interface UploadedFile {
  fileId: string; // direct URL to the uploaded file
  fileName: string;
  fileType: string;
}

export function useStorageUpload() {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const config = await loadConfig();
      const agent = new HttpAgent({
        host: config.backend_host,
      });

      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }

      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const { hash } = await storageClient.putFile(bytes, (pct) => {
        setUploadProgress(pct);
      });

      const directUrl = await storageClient.getDirectURL(hash);

      return {
        fileId: directUrl,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please retry.";
      setUploadError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
  }, []);

  return { uploadFile, uploadProgress, isUploading, uploadError, resetUpload };
}
