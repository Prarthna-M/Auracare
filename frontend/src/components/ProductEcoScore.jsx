import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductEcoScore = ({ ingredients }) => {
  const [ecoData, setEcoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      calculateEcoScore();
    }
  }, [ingredients]);

  const calculateEcoScore = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/eco/calculate',
        { ingredients },
        { headers: { Authorization: token } }
      );
      
      if (response.data.success) {
        setEcoData(response.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error calculating eco score:', err);
      setError('Failed to calculate eco score');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    if (score >= 20) return '#FF9800';
    return '#F44336';
  };

  const getEcoIcon = (rating) => {
    switch(rating) {
      case 'Excellent': return '🌿✨';
      case 'Good': return '🌿';
      case 'Fair': return '🍃';
      case 'Poor': return '⚠️';
      case 'Very Poor': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Calculating environmental impact...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (!ecoData) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🌍 Environmental Impact Score</h3>
      
      <div style={styles.mainScore}>
        <div style={{...styles.scoreCircle, borderColor: getScoreColor(ecoData.overallScore)}}>
          <span style={styles.scoreNumber}>{ecoData.overallScore}</span>
          <span style={styles.scoreLabel}>/100</span>
        </div>
        <div style={styles.scoreInfo}>
          <div style={styles.rating}>
            {getEcoIcon(ecoData.ecoRating)} {ecoData.ecoRating}
          </div>
          <p style={styles.scoreDescription}>
            {ecoData.overallScore >= 80 ? 'Excellent eco-friendly product!' :
             ecoData.overallScore >= 60 ? 'Good environmental choice.' :
             ecoData.overallScore >= 40 ? 'Fair environmental impact.' :
             ecoData.overallScore >= 20 ? 'Poor environmental impact.' :
             'Very poor environmental impact - consider alternatives.'}
          </p>
        </div>
      </div>

      <div style={styles.recommendations}>
        <h4>💡 Recommendations</h4>
        <ul>
          {ecoData.recommendations?.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>

      <div style={styles.breakdown}>
        <h4>🔬 Ingredient Breakdown</h4>
        {ecoData.ingredientsBreakdown?.map((ing, idx) => (
          <div key={idx} style={styles.ingredientRow}>
            <span style={styles.ingredientName}>{ing.name}</span>
            <span style={{...styles.ingredientScore, color: getScoreColor(ing.ecoScore)}}>
              {ing.ecoScore}/100
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '18px',
    color: '#333'
  },
  mainScore: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  scoreCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '4px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white'
  },
  scoreNumber: {
    fontSize: '32px',
    fontWeight: 'bold'
  },
  scoreLabel: {
    fontSize: '12px',
    color: '#666'
  },
  scoreInfo: {
    flex: 1
  },
  rating: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  scoreDescription: {
    color: '#666',
    margin: 0
  },
  recommendations: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  breakdown: {
    marginTop: '10px'
  },
  ingredientRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  ingredientName: {
    color: '#333'
  },
  ingredientScore: {
    fontWeight: 'bold'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '30px',
    background: 'white',
    borderRadius: '12px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px'
  },
  errorContainer: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px'
  }
};

export default ProductEcoScore;