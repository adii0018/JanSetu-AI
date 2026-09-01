"""Tests for NLP service edge cases and robustness."""
import pytest
from app.services.nlp_service import classify_complaint


def test_classify_empty_string():
    """Test classification of empty string."""
    result = classify_complaint("")
    
    assert result["category"] == "General / Other"
    assert 0 <= result["confidence"] <= 100
    assert 0 <= result["urgency"] <= 100


def test_classify_whitespace_only():
    """Test classification of whitespace-only string."""
    result = classify_complaint("   \t\n   ")
    
    assert result["category"] == "General / Other"
    assert 0 <= result["confidence"] <= 100
    assert 0 <= result["urgency"] <= 100


def test_classify_no_keywords():
    """Test classification when no category keywords match."""
    text = "xyz abc 123 random text without keywords"
    result = classify_complaint(text)
    
    assert result["category"] == "General / Other"
    assert result["confidence"] >= 60  # Default confidence
    assert 0 <= result["urgency"] <= 100


def test_classify_all_caps():
    """Test classification with ALL CAPS text."""
    text = "PAANI KI SUPPLY NAHI AA RAHI URGENT EMERGENCY"
    result = classify_complaint(text)
    
    assert result["category"] == "Water Supply"
    assert result["confidence"] > 60
    assert result["urgency"] > 30


def test_classify_mixed_languages_numbers():
    """Test classification with Hindi + English + numbers."""
    text = "Ward 123 में paani problem है, 10 din se nahi aa raha water supply"
    result = classify_complaint(text)
    
    assert result["category"] == "Water Supply"
    assert 0 <= result["confidence"] <= 100
    assert 0 <= result["urgency"] <= 100


def test_classify_special_characters():
    """Test classification with special characters."""
    text = "Paani!!! की supply??? नहीं... आ@रही#है$$$"
    result = classify_complaint(text)
    
    assert result["category"] == "Water Supply"
    assert 0 <= result["confidence"] <= 100
    assert 0 <= result["urgency"] <= 100


def test_confidence_bounds():
    """Test that confidence is always within 0-100."""
    # Test with many keyword matches to push confidence high
    text = "water paani pani supply tanker pipeline peene" * 10
    result = classify_complaint(text)
    
    assert 0 <= result["confidence"] <= 100


def test_urgency_bounds():
    """Test that urgency is always within 0-100."""
    # Test with many urgency words to push urgency high
    text = "urgent emergency bahut kaafi zaroori turant problem pareshani" * 10
    result = classify_complaint(text)
    
    assert 0 <= result["urgency"] <= 100


def test_health_urgency_bonus():
    """Test that Health category gets urgency bonus."""
    text_health = "hospital doctor ambulance emergency"
    result_health = classify_complaint(text_health)
    
    text_other = "road pothole emergency"
    result_other = classify_complaint(text_other)
    
    # Health should have higher urgency due to +12 bonus
    assert result_health["category"] == "Health"
    assert result_other["category"] == "Road"
    # Both have "emergency", but Health should be higher
    assert result_health["urgency"] >= result_other["urgency"]


def test_long_text_performance():
    """Test classification with very long text (edge of max_length)."""
    # Create text close to 2000 characters
    text = "paani ki supply nahi aa rahi hai bahut problem hai " * 35
    result = classify_complaint(text[:2000])
    
    assert result["category"] == "Water Supply"
    assert 0 <= result["confidence"] <= 100
    assert 0 <= result["urgency"] <= 100
