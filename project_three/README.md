# Secure & Monitored Multipart File Upload System

## 📌 Overview

This project implements a **secure, scalable, and production-ready multipart file upload system** using **AWS S3, KMS, Flask, and JavaScript**.  
It supports:
- Large file uploads (up to 5 TB)
- SSE-KMS encryption
- Resume support on network failure
- Real-time progress tracking
- Monitoring & alerting with CloudTrail + CloudWatch

---

## 1️⃣ Project Concept & Motivation

The goal was to design a **security-first, fault-tolerant file upload system** with:
- **Encryption:** SSE-KMS (KMS key rotation enabled)
- **RBAC:** Uploader vs Viewer roles
- **Scalability:** Multipart upload for very large files
- **Observability:** Logs, metrics, alarms

---

## 2️⃣ Architecture Diagram

![Architecture](../project_three/images/arc.png)

---
## 📂 Project Structure

The repository follows a simple, organized layout:
```
.
├── app.py # Flask backend (handles initiate, presign, complete)
├── requirements.txt # Python dependencies
├── .env # Environment variables (not committed)
├── .gitignore # Ignore venv, logs, and secrets
├── static/ # Frontend files (JS, CSS)
│ └── upload.js # Client-side multipart upload logic
├── templates/ # HTML templates (served by Flask)
│ └── index.html # Simple upload page
├── logs/ # (Optional) Local logs directory
└── README.md # Project documentation
```

- **`app.py`** → Main Flask application
- **`static/upload.js`** → Handles chunking, presigned URLs, progress tracking
- **`templates/index.html`** → Simple UI to test uploads
- **`.env`** → Holds `AWS_REGION`, `BUCKET_NAME`, `KMS_KEY_ID` (excluded from git)
- **`logs/`** → For application logs if needed

---

---
## 3️⃣ Role-Based Access Control (RBAC)

| Role      | Allowed Actions |
|----------|----------------|
| **Uploader** | `s3:PutObject`, `s3:AbortMultipartUpload`, `s3:ListMultipartUploadParts`, `kms:GenerateDataKey*` |
| **Viewer**   | `s3:GetObject`, `kms:Decrypt` |

Uploader IAM Policy Example:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:AbortMultipartUpload", "s3:ListMultipartUploadParts"],
      "Resource": "arn:aws:s3:::my-secure-uploads-klawbucket/*"
    },
    {
      "Effect": "Allow",
      "Action": ["kms:GenerateDataKey*", "kms:Encrypt", "kms:Decrypt"],
      "Resource": "arn:aws:kms:us-east-2:<ACCOUNT_ID>:key/<KMS_KEY_ID>"
    }
  ]
}
```

Viewer IAM Policy Example:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::my-secure-uploads-klawbucket/*"
    },
    {
      "Effect": "Allow",
      "Action": ["kms:Decrypt"],
      "Resource": "arn:aws:kms:us-east-2:<ACCOUNT_ID>:key/<KMS_KEY_ID>"
    }
  ]
}

```
## 4️⃣ Flask Backend Code
`app.py`:
```python
import os
import boto3
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

AWS_REGION = os.getenv("AWS_REGION")
BUCKET = os.getenv("BUCKET_NAME")
KMS_KEY_ID = os.getenv("KMS_KEY_ID")

s3 = boto3.client("s3", region_name=AWS_REGION)

@app.route("/initiate", methods=["POST"])
def initiate():
    data = request.json
    key = data.get("key")
    response = s3.create_multipart_upload(
        Bucket=BUCKET,
        Key=key,
        ServerSideEncryption="aws:kms",
        SSEKMSKeyId=KMS_KEY_ID
    )
    return jsonify({"uploadId": response["UploadId"]})

@app.route("/presign", methods=["POST"])
def presign():
    data = request.json
    key, upload_id, part_number = data["key"], data["uploadId"], data["partNumber"]
    url = s3.generate_presigned_url(
        "upload_part",
        Params={
            "Bucket": BUCKET,
            "Key": key,
            "UploadId": upload_id,
            "PartNumber": part_number
        },
        ExpiresIn=3600
    )
    return jsonify({"url": url})

@app.route("/list-parts")
def list_parts():
    upload_id = request.args.get("uploadId")
    key = request.args.get("key")
    response = s3.list_parts(Bucket=BUCKET, Key=key, UploadId=upload_id)
    parts = [{"PartNumber": p["PartNumber"], "ETag": p["ETag"], "Size": p["Size"]} for p in response.get("Parts", [])]
    return jsonify(parts)

@app.route("/complete", methods=["POST"])
def complete():
    data = request.json
    response = s3.complete_multipart_upload(
        Bucket=BUCKET,
        Key=data["key"],
        UploadId=data["uploadId"],
        MultipartUpload={"Parts": data["parts"]}
    )
    return jsonify(response)

```
## 5️⃣ Frontend Code
`static/upload.js`
```python
export async function uploadFile(file, key, onProgress) {
  const init = await fetch("/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  const { uploadId } = await init.json();

  const MAX_PARTS = 10000;
  const MIN_PART_SIZE = 5 * 1024 * 1024;
  const IDEAL_TARGET_PARTS = 1000;
  let partSize = 30 * 1024 * 1024;
  const requiredPartSize = Math.ceil(file.size / IDEAL_TARGET_PARTS);
  if (requiredPartSize > partSize) partSize = requiredPartSize;
  if (partSize < MIN_PART_SIZE) partSize = MIN_PART_SIZE;

  const totalParts = Math.ceil(file.size / partSize);
  if (totalParts > MAX_PARTS) partSize = Math.ceil(file.size / MAX_PARTS);

  const parts = [];
  let uploadedBytes = 0;
  let partNumber = 1;

  for (let start = 0; start < file.size; start += partSize) {
    const chunk = file.slice(start, start + partSize);
    const presignResp = await fetch("/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, uploadId, partNumber }),
    });
    const { url } = await presignResp.json();

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = (((uploadedBytes + e.loaded) / file.size) * 100).toFixed(2);
          if (onProgress) onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag = xhr.getResponseHeader("ETag");
          parts.push({ ETag: etag.replace(/"/g, ""), PartNumber: partNumber });
          uploadedBytes += chunk.size;
          resolve();
        } else reject(new Error(`Failed part ${partNumber}`));
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(chunk);
    });
    partNumber++;
  }

  await fetch("/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, uploadId, parts }),
  });
  if (onProgress) onProgress(100);
}

```
## 6️⃣ Monitoring & Security

- CloudTrail: Enabled to log all S3 + KMS API calls.
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name S3Upload4xxErrors \
  --metric-name 4xxErrors \
  --namespace AWS/S3 \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=BucketName,Value=my-secure-uploads-klawbucket Name=StorageType,Value=AllStorageTypes \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-2:067717894834:S3UploadAlerts

```
- CloudWatch Alarms:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name S3Upload5xxErrors \
  --metric-name 5xxErrors \
  --namespace AWS/S3 \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=BucketName,Value=my-secure-uploads-klawbucket Name=StorageType,Value=AllStorageTypes \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-2:067717894834:S3UploadAlerts


```


