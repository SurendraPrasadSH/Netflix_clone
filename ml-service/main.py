from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from model.recommender import ContentRecommender
import os

app = FastAPI(
    title="Netflix Clone — ML Recommendation Service",
    version="1.0.0"
)

# Load model once at startup
recommender = ContentRecommender()

class RecommendRequest(BaseModel):
    movieId: str
    userId:  str | None = None
    top_n:   int        = 10

@app.get("/health")
def health():
    return {"status": "ok", "movies_indexed": len(recommender.id_to_idx)}

@app.get("/recommend")
def recommend_get(
    movieId: str = Query(..., description="Movie UUID from Supabase"),
    top_n:   int = Query(10,  description="Number of recommendations")
):
    """GET /recommend?movieId=uuid&top_n=10"""
    results = recommender.recommend(movieId, top_n)
    if not results:
        raise HTTPException(status_code=404, detail="Movie not found in model index")
    return {"movieId": movieId, "recommendations": results}

@app.post("/recommend")
def recommend_post(body: RecommendRequest):
    """POST /recommend  { movieId, userId, top_n }"""
    results = recommender.recommend(body.movieId, body.top_n)
    if not results:
        raise HTTPException(status_code=404, detail="Movie not found in model index")
    return {
        "movieId": body.movieId,
        "userId":  body.userId,
        "recommendations": results
    }
