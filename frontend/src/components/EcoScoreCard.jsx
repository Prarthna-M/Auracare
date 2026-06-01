import React from 'react';

const EcoScoreCard = ({ ingredient, score, rating, details }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    if (score >= 20) return '#FF9800';
    return '#F44336';
  };

  const getRatingIcon = (rating) => {
    switch(rating) {
      case 'Excellent': return '🌿✨';
      case 'Good': return '🌿';
      case 'Fair': return '🍃';
      case 'Poor': return '⚠️';
      case 'Very Poor': return '❌';
      default: return '❓';
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.ingredientName}>{ingredient}</h3>
        <div style={styles.scoreContainer}>
          <div style={{...styles.scoreCircle, borderColor: getScoreColor(score)}}>
            <span style={styles.scoreNumber}>{score}</span>
            <span style={styles.scoreLabel}>/100</span>
          </div>
        </div>
      </div>
      
      <div style={styles.ratingBadge}>
        {getRatingIcon(rating)} {rating}
      </div>
      
      {details && (
        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>🌱 Biodegradability:</span>
            <span>{details.biodegradability}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>♻️ Renewable Source:</span>
            <span>{details.renewableSource}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>💧 Water Pollution:</span>
            <span>{details.waterPollution}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>🐟 Aquatic Toxicity:</span>
            <span>{details.aquaticToxicity}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>🌍 Carbon Footprint:</span>
            <span>{details.carbonFootprint}</span>
          </div>
          {details.sustainabilityNotes && (
            <p style={styles.notes}>{details.sustainabilityNotes}</p>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },
  ingredientName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  scoreCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white'
  },
  scoreNumber: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  scoreLabel: {
    fontSize: '10px',
    color: '#666'
  },
  ratingBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    background: '#f0f0f0',
    fontSize: '14px',
    marginBottom: '15px'
  },
  details: {
    marginTop: '10px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px'
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#666'
  },
  notes: {
    marginTop: '12px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic'
  }
};

export default EcoScoreCard;