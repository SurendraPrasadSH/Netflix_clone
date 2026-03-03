import os
import pandas as pd
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

def fetch_movies() -> pd.DataFrame:
    """Fetch all movies from Supabase and return as DataFrame."""
    client = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    )

    response = client.table("movies").select("*").execute()
    movies   = response.data

    if not movies:
        raise ValueError("No movies found in Supabase. Seed your DB first.")

    df = pd.DataFrame(movies)

    # Normalize field names
    df["title"]       = df["title"].fillna("Unknown")
    df["description"] = df["description"].fillna("")
    df["rating"]      = pd.to_numeric(df["rating"], errors="coerce").fillna(0)
    df["year"]        = pd.to_numeric(df["year"],   errors="coerce").fillna(0)
    df["genres"]      = df["genres"].apply(
        lambda g: g if isinstance(g, list) else []
    )

    print(f"✅ Fetched {len(df)} movies from Supabase")
    return df
