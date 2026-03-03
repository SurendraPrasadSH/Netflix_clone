"""
Recommender — Inference Logic
Given a movieId, returns top-N similar movie IDs using
the precomputed cosine similarity matrix.
"""

import os
import pickle
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")

class ContentRecommender:
    def __init__(self):
        self.similarity_matrix = None
        self.id_to_idx         = None
        self.idx_to_id         = None
        self._load()

    def _load(self):
        print("Loading model artifacts...")
        with open(f"{MODEL_DIR}/similarity_matrix.pkl", "rb") as f:
            self.similarity_matrix = pickle.load(f)
        with open(f"{MODEL_DIR}/id_to_idx.pkl", "rb") as f:
            self.id_to_idx = pickle.load(f)
        with open(f"{MODEL_DIR}/idx_to_id.pkl", "rb") as f:
            self.idx_to_id = pickle.load(f)
        print(f"✅ Model loaded — {len(self.id_to_idx)} movies indexed")

    def recommend(self, movie_id: str, top_n: int = 10) -> list[str]:
        """
        Returns top_n most similar movie IDs for a given movie_id.
        Excludes the input movie itself.
        """
        movie_id = str(movie_id)

        if movie_id not in self.id_to_idx:
            print(f"⚠️  Movie ID {movie_id} not found in index")
            return []

        idx = self.id_to_idx[movie_id]

        # Get similarity scores for this movie vs all others
        sim_scores = np.array(
            self.similarity_matrix[idx].todense()
        ).flatten()

        # Sort by score descending, skip index 0 (itself)
        similar_indices = np.argsort(sim_scores)[::-1]

        results = []
        for i in similar_indices:
            if i == idx:
                continue                          # skip itself
            results.append(self.idx_to_id[i])
            if len(results) >= top_n:
                break

        return results

