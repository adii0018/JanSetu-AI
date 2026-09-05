"""
ML Clustering & Intelligence Router for JanSetu.
Provides:
- Semantic Text Clustering (NLP Embeddings + Cosine Similarity)
- Geo DBSCAN Clustering (Density-Based Spatial Clustering)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
import logging

from app.database import get_db
from app.models.complaint import Complaint
from app.models.ward import Ward
from app.services.clustering_service import (
    perform_semantic_clustering,
    perform_dbscan_geo_clustering,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/ml", tags=["ML Clustering & AI Intelligence"])


@router.get("/semantic-clusters", summary="Get Semantic NLP Text Clusters")
async def get_semantic_clusters(db: AsyncSession = Depends(get_db)):
    """
    Returns Semantic NLP Text Clusters.
    Groups complaints with different wording but similar intent 
    (e.g. 'paani nahi aa raha' + 'water supply band hai' + 'nal se kuch nahi aata')
    using TF-IDF Vector Embeddings & Cosine Similarity.
    """
    stmt = select(Complaint, Ward.name).outerjoin(Ward, Complaint.ward_id == Ward.id)
    result = await db.execute(stmt)
    rows = result.all()

    complaint_dicts = [
        {
            "id": c.id,
            "tracking_id": c.tracking_id,
            "raw_text": c.raw_text,
            "category": c.category,
            "urgency": c.urgency,
            "confidence": c.confidence,
            "ward_id": c.ward_id,
            "ward_name": w_name or "",
        }
        for c, w_name in rows
    ]

    semantic_clusters = perform_semantic_clustering(complaint_dicts)
    return {
        "status": "success",
        "algorithm": "TF-IDF Embeddings + Cosine Similarity Vector Matching",
        "total_complaints_analyzed": len(complaint_dicts),
        "total_semantic_clusters": len(semantic_clusters),
        "clusters": semantic_clusters,
    }


@router.get("/geo-clusters", summary="Get Geo DBSCAN Hotspot Clusters")
async def get_geo_clusters(db: AsyncSession = Depends(get_db)):
    """
    Returns Geo Spatial Hotspot Clusters using DBSCAN algorithm.
    Groups wards and complaints into spatial density clusters to declare demand hotspots.
    """
    stmt = (
        select(
            Ward.id,
            Ward.name,
            Ward.lat,
            Ward.lng,
            Ward.infra_index,
            Ward.budget_index,
            func.count(Complaint.id).label("complaint_count"),
            func.coalesce(func.avg(Complaint.urgency), 30).label("avg_urgency"),
        )
        .outerjoin(Complaint, Ward.id == Complaint.ward_id)
        .where(Ward.lat.isnot(None))
        .group_by(Ward.id, Ward.name, Ward.lat, Ward.lng, Ward.infra_index, Ward.budget_index)
    )

    result = await db.execute(stmt)
    ward_rows = result.all()

    ward_dicts = [
        {
            "id": r[0],
            "name": r[1],
            "lat": r[2],
            "lng": r[3],
            "infra_index": r[4],
            "budget_index": r[5],
            "complaint_count": r[6],
            "avg_urgency": float(r[7]),
        }
        for r in ward_rows
    ]

    dbscan_clusters = perform_dbscan_geo_clustering(ward_dicts, eps_km=3.5, min_samples=1)

    return {
        "status": "success",
        "algorithm": "DBSCAN (Density-Based Spatial Clustering of Applications with Noise)",
        "total_wards_analyzed": len(ward_dicts),
        "total_hotspots_detected": len(dbscan_clusters),
        "clusters": dbscan_clusters,
    }


@router.get("/summary", summary="ML Intelligence Overview")
async def get_ml_summary(db: AsyncSession = Depends(get_db)):
    """Summary of ML models active in JanSetu AI Engine."""
    return {
        "status": "operational",
        "nlp_classifier": "Multilingual Rule + Semantic Intent Classifier (10+ Indian Languages)",
        "semantic_clustering": "TF-IDF Cosine Similarity Matrix (Threshold 0.25)",
        "geo_clustering": "DBSCAN Spatial Hotspot Clustering (Eps 3.5km)",
        "priority_engine": "Multi-Criteria Decision Analysis Optimization (45% Demand, 30% Infra Gap, 25% Budget Gap)",
        "speech_engine": "10 BCP-47 Speech Recognition Models + Async Neural TTS Reader",
    }
