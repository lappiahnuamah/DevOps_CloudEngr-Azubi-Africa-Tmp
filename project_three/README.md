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

![Architecture](A_flowchart_diagram_depicts_a_secure,_monitored_fi.png)

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

