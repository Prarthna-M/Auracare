import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AllergySettings = () => {
  const [allergies, setAllergies] = useState([]);
  const [availableAllergies, setAvailableAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchAllergies();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  };

  const fetchAllergies = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const userRes = await axios.get('http://localhost:5000/api/allergies/my-allergies', {
        headers: { Authorization: token }
      });
      setAllergies(userRes.data.allergies || []);
      
      const listRes = await axios.get('http://localhost:5000/api/allergies/list', {
        headers: { Authorization: token }
      });
      setAvailableAllergies(listRes.data.allergies || []);
      
    } catch (error) {
      console.error('Error fetching allergies:', error);
      setMessage('Failed to load allergies');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = (allergy) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter(a => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };

  const saveAllergies = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/allergies/update',
        { allergies },
        { headers: { Authorization: token } }
      );
      
      setMessage('Allergies saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving allergies:', error);
      setMessage('Failed to save allergies');
    } finally {
      setSaving(false);
    }
  };

  const getSeverityColor = (allergy) => {
    const highSeverity = ['Nuts', 'Latex', 'Formaldehyde', 'Nickel'];
    const mediumSeverity = ['Fragrance', 'Parabens', 'Phthalates', 'Sulfates'];
    
    if (highSeverity.includes(allergy)) return '#D47B5C';
    if (mediumSeverity.includes(allergy)) return '#FFA07A';
    return '#6B584C';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading allergy settings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Back to Profile Button */}
      <button 
        onClick={() => navigate('/profile')} 
        style={styles.backButton}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
      >
        ← Back to Profile
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>Allergy Settings</h1>
        <p style={styles.subtitle}>Select ingredients you're allergic to. We'll warn you when products contain them.</p>
      </div>

      <div style={styles.content}>
        {message && (
          <div style={styles.message}>
            {message.includes('success') ? '✓' : '⚠'} {message}
          </div>
        )}

        <div style={styles.allergyGrid}>
          {availableAllergies.map((allergy) => (
            <button
              key={allergy}
              onClick={() => toggleAllergy(allergy)}
              style={{
                ...styles.allergyButton,
                background: allergies.includes(allergy) ? getSeverityColor(allergy) : '#F5F0EB',
                color: allergies.includes(allergy) ? 'white' : '#4A372F',
                border: allergies.includes(allergy) ? 'none' : '1px solid #D4C4AB'
              }}
            >
              {allergies.includes(allergy) ? '✓' : '○'} {allergy}
            </button>
          ))}
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Why set allergies?</h4>
          <p style={styles.infoText}>
            When you check ingredients, we'll automatically warn you if any product contains ingredients you're allergic to. 
            This helps you avoid potential reactions and find safe alternatives.
          </p>
        </div>

        <div style={styles.buttonContainer}>
          <button 
            onClick={saveAllergies} 
            disabled={saving}
            style={styles.saveButton}
          >
            {saving ? 'Saving...' : 'Save Allergies'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 100%)',
    position: 'relative'
  },
  backButton: {
    position: 'sticky',
    top: '20px',
    background: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#D47B5C',
    boxShadow: '0 2px 12px rgba(212, 123, 92, 0.15)',
    transition: 'all 0.3s ease',
    marginBottom: '30px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 10,
    fontFamily: 'inherit'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '42px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#4A372F',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B584C',
    maxWidth: '500px',
    margin: '0 auto'
  },
  content: {
    background: 'white',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.05)'
  },
  message: {
    padding: '14px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'center',
    background: '#E8F5E9',
    color: '#2E7D32',
    fontSize: '14px',
    fontWeight: '500'
  },
  allergyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '32px'
  },
  allergyButton: {
    padding: '12px 16px',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    border: 'none',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center'
  },
  infoBox: {
    background: '#FEF7F2',
    padding: '24px',
    borderRadius: '20px',
    marginBottom: '32px',
    border: '1px solid #FFE0D0'
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#D47B5C'
  },
  infoText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#6B584C',
    margin: 0
  },
  buttonContainer: {
    textAlign: 'center'
  },
  saveButton: {
    padding: '14px 40px',
    background: '#D47B5C',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(212, 123, 92, 0.3)',
    fontFamily: 'inherit'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 100%)'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #FFE0D0',
    borderTop: '3px solid #D47B5C',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  }
};

// Add keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AllergySettings;