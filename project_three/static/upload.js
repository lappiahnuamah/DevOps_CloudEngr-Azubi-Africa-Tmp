export async function uploadFile(file, key, onProgress) {
  // 1) Start multipart upload
  const init = await fetch("/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  const { uploadId } = await init.json();

  // 🔧 Dynamic part size calculation
  const MAX_PARTS = 10000;
  const MIN_PART_SIZE = 5 * 1024 * 1024; // 5MB
  const IDEAL_TARGET_PARTS = 1000;

  let partSize = 30 * 1024 * 1024; // start with 30MB
  const requiredPartSize = Math.ceil(file.size / IDEAL_TARGET_PARTS);
  if (requiredPartSize > partSize) partSize = requiredPartSize;
  if (partSize < MIN_PART_SIZE) partSize = MIN_PART_SIZE;

  const totalParts = Math.ceil(file.size / partSize);
  if (totalParts > MAX_PARTS) {
    partSize = Math.ceil(file.size / MAX_PARTS);
  }

  console.log(`Uploading in ${totalParts} parts, part size = ${(partSize / 1024 / 1024).toFixed(2)} MB`);

  const parts = [];
  let partNumber = 1;
  let uploadedBytes = 0;

  // 2) Upload parts one by one
  for (let start = 0; start < file.size; start += partSize) {
    const chunk = file.slice(start, start + partSize);

    // Presign URL
    const presignResp = await fetch("/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, uploadId, partNumber }),
    });

    const { url } = await presignResp.json();

    // Upload with streaming progress
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          uploadedBytes = start + event.loaded;
          const percent = ((uploadedBytes / file.size) * 100).toFixed(2);
          if (onProgress) onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag = xhr.getResponseHeader("ETag");
          parts.push({ ETag: etag.replace(/"/g, ""), PartNumber: partNumber });
          resolve();
        } else {
          reject(new Error(`Failed to upload part ${partNumber}`));
        }
      };

      xhr.onerror = () => reject(new Error(`Network error on part ${partNumber}`));

      xhr.send(chunk);
    });

    partNumber++;
  }

  // 3) Complete multipart upload
  await fetch("/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, uploadId, parts }),
  });

  if (onProgress) onProgress(100); // Ensure 100% is reported
}

