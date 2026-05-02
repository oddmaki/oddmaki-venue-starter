import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY,
});

/**
 * POST /api/ipfs/upload
 *
 * Accepts either:
 * - multipart/form-data with a 'file' field (for images)
 * - application/json body (for metadata JSON)
 *
 * Returns { cid, uri } where uri is "ipfs://<cid>"
 */
export async function POST(request: NextRequest) {
  if (!process.env.PINATA_JWT) {
    return NextResponse.json(
      { error: "PINATA_JWT not configured" },
      { status: 500 },
    );
  }

  const contentType = request.headers.get("content-type") || "";

  try {
    let file: File;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const uploaded = formData.get("file");

      if (!uploaded || !(uploaded instanceof File)) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 },
        );
      }
      file = uploaded;
    } else {
      // JSON upload — wrap as a File for the unified v3 API
      const body = await request.json();

      file = new File([JSON.stringify(body)], "metadata.json", {
        type: "application/json",
      });
    }

    const result = await pinata.upload.public.file(file);

    return NextResponse.json({
      cid: result.cid,
      uri: `ipfs://${result.cid}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 },
    );
  }
}
