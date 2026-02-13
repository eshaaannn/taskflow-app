from supabase import create_client
from config import settings

url = settings.SUPABASE_URL
service_key = settings.SUPABASE_SERVICE_ROLE_KEY

if not url or not service_key:
    raise RuntimeError(
        "Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    )

supabase_admin = create_client(url, service_key)
