"""
Clustering & NLP Intelligence Service for JanSetu.
Provides:
1. Semantic Text Clustering (TF-IDF Vector Embeddings + Cosine Similarity Grouping)
2. Geo DBSCAN Clustering (Density-Based Spatial Clustering for Demand Hotspots)
"""
import math
import re
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text into word tokens."""
    cleaned = re.sub(r'[^\w\s]', ' ', text.lower())
    return [w for w in cleaned.split() if len(w) > 1]


def compute_tfidf_vectors(corpus: List[str]) -> Tuple[List[Dict[str, float]], List[str]]:
    """
    Compute TF-IDF (Term Frequency - Inverse Document Frequency) feature vectors for text corpus.
    """
    num_docs = len(corpus)
    if num_docs == 0:
        return [], []

    tokenized_docs = [tokenize(doc) for doc in corpus]
    
    # Calculate Document Frequency (DF) for each term
    df: Dict[str, int] = {}
    for doc in tokenized_docs:
        unique_terms = set(doc)
        for term in unique_terms:
            df[term] = df.get(term, 0) + 1

    vocabulary = list(df.keys())
    
    # Calculate TF-IDF vectors
    vectors: List[Dict[str, float]] = []
    for doc in tokenized_docs:
        tf: Dict[str, int] = {}
        for term in doc:
            tf[term] = tf.get(term, 0) + 1

        vec: Dict[str, float] = {}
        doc_len = len(doc) or 1
        for term, count in tf.items():
            tf_val = count / doc_len
            idf_val = math.log((1 + num_docs) / (1 + df[term])) + 1
            vec[term] = tf_val * idf_val
        vectors.append(vec)

    return vectors, vocabulary


def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Calculate Cosine Similarity between two TF-IDF sparse vectors."""
    dot_product = sum(vec1[k] * vec2[k] for k in vec1 if k in vec2)
    norm1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
    norm2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)


def extract_location_name(text: str, ward_name: str = "") -> str:
    """Extract city/location name from ward or raw text."""
    if ward_name:
        parts = ward_name.split(" - ")
        if len(parts) > 1:
            return parts[0]
        return ward_name
    
    cities = ["indore", "delhi", "mumbai", "bengaluru", "bangalore", "lucknow", "jaipur", "ahmedabad", "hyderabad", "chennai", "kolkata", "bhopal", "pune", "noida", "varanasi"]
    text_lower = text.lower()
    for city in cities:
        if city in text_lower:
            return city.capitalize()
    return "City Area"


def perform_semantic_clustering(complaints: List[Dict[str, Any]], similarity_threshold: float = 0.25) -> List[Dict[str, Any]]:
    """
    Group complaints into Semantic Clusters using TF-IDF Vector Embeddings, Concept Mapping, and Location Matching.
    
    Complaints with different wording but similar semantic meaning (e.g. 'aaj indore me 3 dino se pani ki problem he' + 
    'water issu in indore') are grouped into the same unified AI problem cluster.
    """
    if not complaints:
        return []

    texts = [c.get("raw_text", "") for c in complaints]
    vectors, _ = compute_tfidf_vectors(texts)
    
    n = len(complaints)
    visited = [False] * n
    clusters: List[Dict[str, Any]] = []

    for i in range(n):
        if visited[i]:
            continue

        current_cluster_items = [complaints[i]]
        visited[i] = True
        loc_i = extract_location_name(complaints[i].get("raw_text", ""), complaints[i].get("ward_name", ""))

        for j in range(i + 1, n):
            if visited[j]:
                continue

            sim = cosine_similarity(vectors[i], vectors[j])
            cat_i = complaints[i].get("category", "")
            cat_j = complaints[j].get("category", "")
            loc_j = extract_location_name(complaints[j].get("raw_text", ""), complaints[j].get("ward_name", ""))

            # Group if high semantic vector similarity OR (same category AND matching location/ward)
            if sim >= similarity_threshold or (cat_i == cat_j and (loc_i == loc_j or loc_i == "City Area" or loc_j == "City Area")):
                current_cluster_items.append(complaints[j])
                visited[j] = True

        category = complaints[i].get("category", "General / Other")
        location = loc_i
        cluster_id = f"SEM-CLUSTER-{len(clusters) + 1:02d}"
        avg_urgency = round(sum(item.get("urgency", 30) for item in current_cluster_items) / len(current_cluster_items), 1)

        count = len(current_cluster_items)
        if location and location != "City Area":
            title = f"{location}: {category} Issue ({count} Citizen Complaints Merged by AI)"
        else:
            title = f"{category} Problem Cluster ({count} Issues Grouped by AI)"

        clusters.append({
            "cluster_id": cluster_id,
            "category": category,
            "location": location,
            "cluster_name": title,
            "count": count,
            "demand_multiplier": round(1.0 + (count - 1) * 0.45, 2),
            "avg_urgency": avg_urgency,
            "sample_texts": [item.get("raw_text", "") for item in current_cluster_items[:3]],
            "complaint_ids": [item.get("tracking_id", "") for item in current_cluster_items],
            "merged_by_ai": True if count > 1 else False,
        })

    return sorted(clusters, key=lambda x: (x["count"], x["avg_urgency"]), reverse=True)


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate Haversine distance in kilometers between two GPS coordinates."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def perform_dbscan_geo_clustering(wards: List[Dict[str, Any]], eps_km: float = 3.0, min_samples: int = 1) -> List[Dict[str, Any]]:
    """
    DBSCAN (Density-Based Spatial Clustering of Applications with Noise) Geo-Clustering Algorithm.
    Groups geographical wards & complaint locations into Demand Hotspots based on spatial density.
    """
    valid_wards = [w for w in wards if w.get("lat") is not None and w.get("lng") is not None]
    if not valid_wards:
        return []

    n = len(valid_wards)
    labels = [-1] * n  # -1 means unvisited/noise
    cluster_id = 0

    for i in range(n):
        if labels[i] != -1:
            continue

        # Find neighbors within eps_km radius
        neighbors = []
        for j in range(n):
            dist = haversine_distance(valid_wards[i]["lat"], valid_wards[i]["lng"], valid_wards[j]["lat"], valid_wards[j]["lng"])
            if dist <= eps_km:
                neighbors.append(j)

        if len(neighbors) < min_samples:
            labels[i] = -1  # Noise / Low density
        else:
            labels[i] = cluster_id
            i_neighbors = set(neighbors)
            while i_neighbors:
                curr = i_neighbors.pop()
                if labels[curr] == -1:
                    labels[curr] = cluster_id
                
                curr_neighbors = []
                for k in range(n):
                    dist = haversine_distance(valid_wards[curr]["lat"], valid_wards[curr]["lng"], valid_wards[k]["lat"], valid_wards[k]["lng"])
                    if dist <= eps_km:
                        curr_neighbors.append(k)

                if len(curr_neighbors) >= min_samples:
                    for kn in curr_neighbors:
                        if labels[kn] == -1:
                            labels[kn] = cluster_id
                            i_neighbors.add(kn)

            cluster_id += 1

    # Group into Hotspot Clusters
    cluster_groups: Dict[int, List[Dict[str, Any]]] = {}
    for idx, cid in enumerate(labels):
        cluster_groups.setdefault(cid, []).append(valid_wards[idx])

    geo_hotspots: List[Dict[str, Any]] = []
    for cid, ward_list in cluster_groups.items():
        avg_lat = sum(w["lat"] for w in ward_list) / len(ward_list)
        avg_lng = sum(w["lng"] for w in ward_list) / len(ward_list)
        total_complaints = sum(w.get("complaint_count", 0) for w in ward_list)
        avg_urgency = round(sum(w.get("avg_urgency", 30) for w in ward_list) / len(ward_list), 1)

        geo_hotspots.append({
            "hotspot_id": f"DBSCAN-HOTSPOT-{cid + 1 if cid >= 0 else 0:02d}",
            "name": f"Demand Cluster: {ward_list[0]['name']} Zone" if ward_list else "General Zone",
            "ward_names": [w["name"] for w in ward_list],
            "total_wards": len(ward_list),
            "center_lat": round(avg_lat, 6),
            "center_lng": round(avg_lng, 6),
            "total_complaints": total_complaints,
            "avg_urgency": avg_urgency,
            "hotspot_level": "Critical" if avg_urgency >= 65 or total_complaints >= 5 else "Moderate" if avg_urgency >= 45 else "Low",
            "ml_algorithm": "DBSCAN (Density-Based Spatial Clustering)",
        })

    return sorted(geo_hotspots, key=lambda x: (x["total_complaints"], x["avg_urgency"]), reverse=True)
