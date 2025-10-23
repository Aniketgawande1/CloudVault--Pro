

# ☁️ **CloudVault – Intelligent Cloud File Manager & Backup System**

### 📦 **Overview**

**CloudVault** is a cloud-native file management and backup platform built with **Python (Flask)**, **React**, and **Google Cloud Platform (GCP)**.
It enables users to securely **upload, back up, and restore files** using serverless architecture powered by **Cloud Functions** and **Cloud Storage** — all within the **free tier** of GCP.

---

## 🚀 **Key Features**

* 🗂 **File Uploads** — Upload user files directly to GCP Cloud Storage.
* 🕒 **Automated Backups** — Generate and store backup manifests with metadata.
* 🔄 **Restore System** — Restore user files or versions from backup archives.
* 🧩 **Modular Backend** — Each function (Upload, Backup, Restore) runs independently.
* 🔐 **User Authentication (Optional)** — Token-based access control ready via `auth.py`.
* ☁️ **Fully Serverless** — Scalable, pay-per-use deployment on GCP free tier.

---

## 🧱 **Project Structure**

```
server/
├── backend/
│   └── core/
│       ├── backup.py
│       ├── restore.py
│       └── utils/
│           ├── gcs.py
│           ├── auth.py
│           └── logger.py
│
├── functions/
│   ├── upload/
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── __init__.py
│   ├── backup/
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── __init__.py
│   ├── restore/
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── __init__.py
│   └── utils/
│       ├── config.py
│       └── __init__.py
│
├── .env
└── test-functions.py
```

---

## 🧰 **Tech Stack**

| Layer                        | Technology                           |
| ---------------------------- | ------------------------------------ |
| **Frontend**                 | React + TailwindCSS                  |
| **Backend**                  | Python (Flask + Functions Framework) |
| **Cloud**                    | Google Cloud Platform (GCP)          |
| **Storage**                  | Google Cloud Storage (GCS)           |
| **Compute**                  | Cloud Functions (Gen 2)              |
| **IAM**                      | Service Accounts & Token-based Auth  |
| **Infra as Code (Optional)** | Terraform / Cloud Deployment Manager |

---

## ☁️ **GCP Services Used**

| Service                 | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| **Cloud Functions**     | Runs serverless backend logic (upload, backup, restore). |
| **Cloud Storage (GCS)** | Stores user files and backups.                           |
| **Cloud Build**         | Handles function builds & deployments.                   |
| **Artifact Registry**   | Stores container images (used by Gen2 functions).        |
| **Cloud IAM**           | Controls access & authentication.                        |

---

## ⚙️ **Deployment Steps**

### 1️⃣ Authenticate & Select Project

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2️⃣ Enable APIs

```bash
gcloud services enable cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  storage.googleapis.com
```

### 3️⃣ Create Buckets

```bash
gsutil mb -l asia-south1 gs://cloudvault-userfiles/
gsutil mb -l asia-south1 gs://cloudvault-backups/
```

### 4️⃣ Deploy Each Cloud Function

#### Upload Function

```bash
cd server/functions/upload
gcloud functions deploy upload_file \
  --gen2 \
  --runtime python311 \
  --region asia-south1 \
  --source=. \
  --entry-point=main \
  --trigger-http \
  --allow-unauthenticated
```

#### Backup Function

```bash
cd ../backup
gcloud functions deploy backup_data \
  --gen2 \
  --runtime python311 \
  --region asia-south1 \
  --source=. \
  --entry-point=main \
  --trigger-http \
  --allow-unauthenticated
```

#### Restore Function

```bash
cd ../restore
gcloud functions deploy restore_data \
  --gen2 \
  --runtime python311 \
  --region asia-south1 \
  --source=. \
  --entry-point=main \
  --trigger-http \
  --allow-unauthenticated
```

---

## 🧾 **Example `requirements.txt`**

```txt
Flask==3.0.0
google-cloud-storage==2.10.0
python-dotenv==1.0.0
functions-framework==3.*
```

---

## 🧪 **Testing (Postman / cURL)**

**Upload Example**

```bash
curl -X POST https://asia-south1-YOUR_PROJECT.cloudfunctions.net/upload_file \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.txt","content":"SGVsbG8gV29ybGQ="}'
```

---

## 💻 **Frontend Integration**

Call your API endpoints from React:

```js
await fetch("https://asia-south1-YOUR_PROJECT.cloudfunctions.net/upload_file", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    filename: "hello.txt",
    content: btoa("Hello from CloudVault!"),
  }),
});
```

---

## 🧠 **Concepts Learned**

✅ Cloud Storage (GCS)
✅ Cloud Functions (Gen 2)
✅ Serverless Architecture
✅ IAM & Authentication
✅ Environment Variables
✅ RESTful API Design
✅ React-GCP Integration
✅ Backup & Restore Logic
✅ Cloud Deployment Workflow

---

## 🏗 **Future Enhancements**

* 🔒 OAuth or Firebase Auth integration
* 🧾 File versioning
* 🕹 Dashboard with file preview & restore options
* 💾 Scheduled backups using Cloud Scheduler
* 🧠 AI-based file insights (Gemini API)

---

## 🧑‍💻 **Author**

**Project:** CloudVault
**Developer:** Aniket Gawande (Software Engineer)
**Tech Stack:** Python | React | Google Cloud | Serverless Architecture

