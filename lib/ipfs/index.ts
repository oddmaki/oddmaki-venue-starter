/**
 * Upload a JSON object to IPFS via the Next.js API route.
 * Returns the IPFS URI (e.g. "ipfs://QmXyz...")
 */
export async function uploadToIPFS(data: object): Promise<string> {
  const response = await fetch("/api/ipfs/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.error || "IPFS upload failed");
  }

  const result = await response.json();

  return result.uri;
}

/**
 * Upload a file (e.g. image) to IPFS via the Next.js API route.
 * Returns the IPFS URI (e.g. "ipfs://QmXyz...")
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch("/api/ipfs/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.error || "IPFS image upload failed");
  }

  const result = await response.json();

  return result.uri;
}
