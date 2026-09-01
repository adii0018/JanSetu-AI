"""Tests for NLP service classification logic."""
import pytest
from app.services.nlp_service import classify_complaint


def test_classify_water_complaint():
    """Test classification of water supply complaint."""
    text = "10 din se paani ki supply nahi aa rahi hai"
    result = classify_complaint(text)
    
    assert result["category"] == "Water Supply"
    assert 0 <= result["confidence"] <= 100
    assert 0 <= result["urgency"] <= 100


def test_classify_road_complaint():
    """Test classification of road complaint."""
    text = "Sadak par bade gaddhe hain, pothole bahut hai"
    result = classify_complaint(text)
    
    assert result["category"] == "Road"
    assert result["confidence"] > 60


def test_classify_health_complaint():
    """Test classification of health complaint with urgency boost."""
    text = "Hospital mein doctor nahi hai, emergency bahut urgent"
    result = classify_complaint(text)
    
    assert result["category"] == "Health"
    # Health complaints get +12 urgency bonus
    assert result["urgency"] > 50


def test_classify_electricity_complaint():
    """Test classification of electricity complaint."""
    text = "Bijli nahi aa rahi, transformer kharab hai"
    result = classify_complaint(text)
    
    assert result["category"] == "Electricity"


def test_classify_education_complaint():
    """Test classification of education complaint."""
    text = "School mein teacher nahi aate, bachchon ki padhai problem"
    result = classify_complaint(text)
    
    assert result["category"] == "Education"


def test_classify_sanitation_complaint():
    """Test classification of sanitation complaint."""
    text = "Kachra collection nahi ho raha, safai nahi ho rahi"
    result = classify_complaint(text)
    
    assert result["category"] == "Sanitation"


def test_classify_general_complaint():
    """Test classification of complaint with no category keywords."""
    text = "Random complaint without specific keywords"
    result = classify_complaint(text)
    
    assert result["category"] == "General / Other"
    assert result["confidence"] >= 60


def test_urgency_calculation():
    """Test urgency score increases with urgency words."""
    # Text without urgency words
    text1 = "Sadak par gaddhe hain"
    result1 = classify_complaint(text1)
    
    # Text with urgency words
    text2 = "Sadak par gaddhe hain, bahut urgent emergency hai zaroori"
    result2 = classify_complaint(text2)
    
    # Second should have higher urgency
    assert result2["urgency"] > result1["urgency"]


def test_confidence_increases_with_matches():
    """Test confidence increases with more keyword matches."""
    # Text with one keyword
    text1 = "Paani problem"
    result1 = classify_complaint(text1)
    
    # Text with multiple keywords
    text2 = "Paani ki supply nahi, water tanker bhi nahi aaya, pipeline leak"
    result2 = classify_complaint(text2)
    
    # Second should have higher confidence
    assert result2["confidence"] > result1["confidence"]
