import React from 'react';

const AllergyWarning = ({ warnings, safeAlternatives }) => {
  if (!warnings || warnings.length === 0) return null;

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'High': return '#f44336';
      case 'Medium': return '#ff9800';
      default: return '#ffc107';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>⚠️</span>
        <h3 style={styles.title}>Allergy Alert!</h3>
      </div>
      
      <p style={styles.message}>
        This product contains {warnings.length} ingredient(s) you're allergic to.
      </p>
      
      <div style={styles.warningsList}>
        {warnings.map((warning, idx) => (
          <div key={idx} style={styles.warningItem}>
            <div style={{...styles.severityBadge, background: getSeverityColor(warning.severity)}}>
              {warning.severity}
            </div>
            <div style={styles.warningContent}>
              <strong style={styles.ingredient}>{warning.ingredient}</strong>
              <span style={styles.allergen}>contains {warning.allergen}</span>
              <p style={styles.recommendation}>{warning.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
      
      {safeAlternatives && safeAlternatives.length > 0 && (
        <div style={styles.alternatives}>
          <h4>🌱 Safe Alternatives</h4>
          <ul>
            {safeAlternatives.map((alt, idx) => (
              <li key={idx}>{alt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#fff3e0',
    border: '1px solid #ffb74d',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px'
  },
  icon: {
    fontSize: '24px'
  },
  title: {
    margin: 0,
    color: '#f57c00'
  },
  message: {
    marginBottom: '15px',
    fontWeight: 'bold',
    color: '#e65100'
  },
  warningsList: {
    marginBottom: '15px'
  },
  warningItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
    marginBottom: '10px'
  },
  severityBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    minWidth: '60px',
    textAlign: 'center'
  },
  warningContent: {
    flex: 1
  },
  ingredient: {
    display: 'block',
    fontSize: '14px'
  },
  allergen: {
    fontSize: '12px',
    color: '#f57c00'
  },
  recommendation: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px'
  },
  alternatives: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #ffb74d'
  }
};

export default AllergyWarning;