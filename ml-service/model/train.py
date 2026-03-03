"""
Content-Based Recommender — Training Script
Builds a cosine similarity matrix from:
  - TF-IDF on movie descriptions  (captures plot similarity)
  - Genre one-hot encoding         (captures genre similarity)
  - Normalized rating + year       (captures era/quality similarity)
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack, csr_matrix
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.fetch_movies import fetch_movies

MODEL_DIR  = os.path.join(os.path.dirname(__file__), "artifacts")
os.makedirs(MODEL_DIR, exist_ok=True)

def train():
    print("🎬 Starting model training...")
    df = fetch_movies()

    # ── Feature 1: TF-IDF on descriptions ─────────────────
    print("Building TF-IDF features from descriptions...")
    tfidf = TfidfVectorizer(
        max_features=5000,
        stop_words="english",
        ngram_range=(1, 2)      # unigrams + bigrams
    )
    tfidf_matrix = tfidf.fit_transform(df["description"])
    print(f"  TF-IDF shape: {tfidf_matrix.shape}")

    # ── Feature 2: Genre one-hot encoding ─────────────────
    print("Building genre features...")
    mlb = MultiLabelBinarizer()
    genre_matrix = csr_matrix(mlb.fit_transform(df["genres"]))
    print(f"  Genre matrix shape: {genre_matrix.shape}")

    # ── Feature 3: Normalized rating + year ───────────────
    print("Building numerical features...")
    scaler = MinMaxScaler()
    num_features = scaler.fit_transform(df[["rating", "year"]])
    num_matrix   = csr_matrix(num_features)
    print(f"  Numerical shape: {num_matrix.shape}")

    # ── Combine all features ───────────────────────────────
    # Weights: description=1.0, genres=2.0 (boosted), numbers=0.5
    feature_matrix = hstack([
        tfidf_matrix  * 1.0,
        genre_matrix  * 2.0,
        num_matrix    * 0.5,
    ])
    print(f"  Combined feature matrix shape: {feature_matrix.shape}")

    # ── Cosine Similarity ──────────────────────────────────
    print("Computing cosine similarity matrix...")
    similarity_matrix = cosine_similarity(feature_matrix, dense_output=False)
    print(f"  Similarity matrix shape: {similarity_matrix.shape}")

    # ── Save artifacts ─────────────────────────────────────
    print("Saving model artifacts...")
    with open(f"{MODEL_DIR}/similarity_matrix.pkl", "wb") as f:
        pickle.dump(similarity_matrix, f)

    with open(f"{MODEL_DIR}/tfidf.pkl", "wb") as f:
        pickle.dump(tfidf, f)

    with open(f"{MODEL_DIR}/mlb.pkl", "wb") as f:
        pickle.dump(mlb, f)

    with open(f"{MODEL_DIR}/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    # Save movie index map: movie_id → matrix row index
    id_to_idx = {str(row["id"]): idx for idx, row in df.iterrows()}
    idx_to_id = {idx: str(row["id"]) for idx, row in df.iterrows()}

    with open(f"{MODEL_DIR}/id_to_idx.pkl", "wb") as f:
        pickle.dump(id_to_idx, f)

    with open(f"{MODEL_DIR}/idx_to_id.pkl", "wb") as f:
        pickle.dump(idx_to_id, f)

    print(f"✅ Model trained and saved to {MODEL_DIR}")
    print(f"   Movies indexed: {len(df)}")

if __name__ == "__main__":
    train()
