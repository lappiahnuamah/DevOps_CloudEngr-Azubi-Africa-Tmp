import os
from flask import Flask, render_template, request, jsonify
import boto3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "us-east-2")
BUCKET = os.getenv("BUCKET_NAME")
KMS_KEY = os.getenv("KMS_KEY_ID")

app = Flask(__name__)
s3 = boto3.client('s3', region_name=AWS_REGION)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/initiate", methods=["POST"])
def initiate():
    data = request.json
    key = data["key"]
    resp = s3.create_multipart_upload(
        Bucket=BUCKET,
        Key=key,
        ServerSideEncryption="aws:kms",
        SSEKMSKeyId=KMS_KEY
    )
    return jsonify({"uploadId": resp["UploadId"]})

@app.route("/presign", methods=["POST"])
def presign():
    data = request.json
    key = data["key"]
    upload_id = data["uploadId"]
    part_number = int(data["partNumber"])

    url = s3.generate_presigned_url(
        ClientMethod="upload_part",
        Params={
            "Bucket": BUCKET,
            "Key": key,
            "UploadId": upload_id,
            "PartNumber": part_number,
        },
        ExpiresIn=3600,
        HttpMethod="PUT"
    )
    return jsonify({"url": url})

@app.route("/complete", methods=["POST"])
def complete():
    data = request.json
    key = data["key"]
    upload_id = data["uploadId"]
    parts = data["parts"]

    resp = s3.complete_multipart_upload(
        Bucket=BUCKET,
        Key=key,
        UploadId=upload_id,
        MultipartUpload={"Parts": parts}
    )
    return jsonify(resp)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

