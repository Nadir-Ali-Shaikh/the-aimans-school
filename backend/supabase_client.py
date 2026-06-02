import os
from pathlib import Path
from dotenv import load_dotenv
import httpx

# Resolve the path to the root .env file
# backend/supabase_client.py is located at <root>/backend/supabase_client.py
# The .env file is located at <root>/.env
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent
env_path = root_dir / ".env"

print(f"[Supabase Client] Looking for .env at: {env_path}")

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print("[Supabase Client] Loaded .env file successfully.")
else:
    # Fallback to current working directory or environment
    load_dotenv()
    print("[WARNING] [Supabase Client] .env file not found in root, falling back to system environment variables.")

# Retrieve credentials
# Try VITE_ prefixed keys first (used in Vite apps), then fallback to standard Supabase keys
supabase_url = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY") or os.environ.get("SUPABASE_PUBLISHABLE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError(
        "Supabase credentials missing! Ensure VITE_SUPABASE_URL / SUPABASE_URL "
        "and VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_PUBLISHABLE_KEY are set in the .env file."
    )

print(f"[Supabase Client] Configured URL: {supabase_url}")


class PostgrestQueryBuilder:
    """
    Query builder mimicking PostgREST / Supabase Python library APIs
    """
    def __init__(self, client: httpx.Client, supabase_url: str, supabase_key: str, table_name: str):
        self.client = client
        self.supabase_url = supabase_url.rstrip("/")
        self.supabase_key = supabase_key
        self.table_name = table_name
        self.params = {}
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
        self.method = "GET"
        self.json_data = None

    def select(self, columns: str = "*"):
        self.params["select"] = columns
        return self

    def eq(self, column: str, value):
        # Convert Python booleans to lower-cased strings for PostgREST
        if isinstance(value, bool):
            value = str(value).lower()
        self.params[column] = f"eq.{value}"
        return self

    def order(self, column: str, desc: bool = False):
        direction = "desc" if desc else "asc"
        if "order" in self.params:
            self.params["order"] += f",{column}.{direction}"
        else:
            self.params["order"] = f"{column}.{direction}"
        return self

    def limit(self, count: int):
        self.params["limit"] = count
        return self

    def insert(self, data: dict):
        self.method = "POST"
        # Prefer: return=representation tells PostgREST to return the inserted record
        self.headers["Prefer"] = "return=representation"
        self.json_data = data
        return self

    def execute(self):
        url = f"{self.supabase_url}/rest/v1/{self.table_name}"
        
        try:
            if self.method == "GET":
                response = self.client.get(url, params=self.params, headers=self.headers)
            elif self.method == "POST":
                response = self.client.post(url, json=self.json_data, headers=self.headers)
            else:
                raise ValueError(f"Unsupported method: {self.method}")
            
            response.raise_for_status()
            
            class ExecuteResult:
                def __init__(self, data):
                    self.data = data
                    
            return ExecuteResult(response.json())
        except Exception as e:
            print(f"[Supabase Client Error] Method: {self.method}, Table: {self.table_name}, Params: {self.params}, Error: {e}")
            raise e


class SupabaseClientWrapper:
    """
    Substitutes official supabase Client. Exposes exact table querying API endpoints
    built directly on top of lightweight, fast httpx calls.
    """
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self._client = httpx.Client()

    def table(self, table_name: str) -> PostgrestQueryBuilder:
        return PostgrestQueryBuilder(self._client, self.supabase_url, self.supabase_key, table_name)


# Export the configured lightweight client
supabase = SupabaseClientWrapper(supabase_url, supabase_key)


def check_connection() -> bool:
    """
    Checks the Supabase connection by executing a fast limit 1 query.
    Returns True if connection is active, False otherwise.
    """
    try:
        supabase.table("notices").select("id").limit(1).execute()
        return True
    except Exception as e:
        print(f"[Supabase Client] Connection check failed: {e}")
        return False
