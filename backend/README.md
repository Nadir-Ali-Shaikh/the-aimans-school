# The Aiman's School Umerkot - Python FastAPI Backend

This is the Python-based backend API for **The Aiman's School Umerkot**. It is built with **FastAPI** and connects to the existing **Supabase** instance.

## Features
- **Auto-Configured**: Loads database URL and publishable key directly from the root `.env` file automatically.
- **Robust Endpoints**:
  - `GET /` - Root welcoming, system state, database link confirmation.
  - `GET /api/db-status` - Direct query checking to Supabase.
  - `GET /api/notices` - Fetch published notices from the database.
  - `GET /api/teachers` - Fetch teacher roster ordered by custom sort.
  - `GET /api/blogs` - Fetch active school blog posts.
  - `POST /api/contact` - Insert structured contact inquiries securely.
- **FastAPI Interactive Docs**: Self-documenting API using Swagger (available at `/docs`).

## Directory Structure
```
backend/
├── .venv/               # Auto-created virtual environment
├── main.py              # FastAPI app definition and endpoints
├── supabase_client.py   # Database client initialization and validation
├── requirements.txt     # Python packages list
└── README.md            # You are here!
```

## Setup & Running

We have created a double-clickable launcher in your root workspace folder:
Simply double-click **`run-backend.bat`** from the root!

It will:
1. Verify if Python (`py` utility) is installed.
2. Initialize a local virtual environment (`backend/.venv`) if missing.
3. Automatically install all needed dependencies from `requirements.txt`.
4. Launch the server in development hot-reload mode on port `8000` (`http://localhost:8000`).

### Accessing API Documentation
When the server is running, visit:
- **Interactive OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
- **Alternative Redoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Integrating with the React Frontend

To consume these endpoints in your TanStack React components, you can call them using `fetch` or integrate them into `@tanstack/react-query`.

### Example Fetch Call:
```typescript
import { useEffect, useState } from "react";

interface Notice {
  id: string;
  title: string;
  body: string | null;
  important: boolean;
  published_at: string;
}

export function NoticesComponent() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/notices")
      .then((res) => res.json())
      .then((data) => {
        setNotices(data.notices || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch notices from Python backend:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading school notices...</div>;

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <div key={notice.id} className={`p-4 rounded-lg border ${notice.important ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <h3 className="font-bold">{notice.title}</h3>
          {notice.body && <p className="mt-2 text-gray-600">{notice.body}</p>}
        </div>
      ))}
    </div>
  );
}
```
