import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Routine = () => {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('morning');
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoutine();
  }, []);

  const fetchRoutine = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/routine', {
        headers: { Authorization: token }
      });

      setRoutine(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching routine:', err);
      setError('Failed to load your skincare routine');
      setLoading(false);
    }
  };

  const morningProducts = routine?.morning || [];
  const nightProducts = routine?.night || [];

  const categories = {
    cleanser: {
      name: 'Cleanser',
      icon: '🧼',
      morning: morningProducts.filter(p => p.productType?.toLowerCase().includes('cleanser')),
      night: nightProducts.filter(p => p.productType?.toLowerCase().includes('cleanser'))
    },
    serum: {
      name: 'Serum',
      icon: '💧',
      morning: morningProducts.filter(p => p.productType?.toLowerCase().includes('serum')),
      night: nightProducts.filter(p => p.productType?.toLowerCase().includes('serum'))
    },
    moisturizer: {
      name: 'Moisturizer',
      icon: '🧴',
      morning: morningProducts.filter(p => p.productType?.toLowerCase().includes('moisturizer')),
      night: nightProducts.filter(p => p.productType?.toLowerCase().includes('moisturizer'))
    },
    sunscreen: {
      name: 'Sunscreen',
      icon: '☀️',
      morning: morningProducts.filter(p => p.productType?.toLowerCase().includes('sunscreen')),
      night: []
    },
    treatment: {
      name: 'Treatment',
      icon: '✨',
      morning: [],
      night: nightProducts.filter(p => p.productType?.toLowerCase().includes('treatment') || p.productType?.toLowerCase().includes('mask'))
    }
  };

  const getCurrentProducts = () => {
    if (activeFilter === 'all') {
      const allProducts = [];
      Object.keys(categories).forEach(key => {
        const products = activeTab === 'morning' ? categories[key].morning : categories[key].night;
        allProducts.push(...products);
      });
      return allProducts;
    }
    return activeTab === 'morning' ? categories[activeFilter]?.morning || [] : categories[activeFilter]?.night || [];
  };

  const currentProducts = getCurrentProducts();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your routine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchRoutine} style={styles.retryBtn}>Try Again</button>
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

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Skincare Routine</h1>
        <p style={styles.subtitle}>Based on your <strong>{routine?.skinType || 'Normal'}</strong> skin type</p>
      </div>

      {/* Tab Buttons */}
      <div style={styles.tabs}>
        <button
          onClick={() => {
            setActiveTab('morning');
            setActiveFilter('all');
          }}
          style={{
            ...styles.tab,
            ...(activeTab === 'morning' ? styles.tabActive : {})
          }}
        >
          🌅 Morning
        </button>
        <button
          onClick={() => {
            setActiveTab('night');
            setActiveFilter('all');
          }}
          style={{
            ...styles.tab,
            ...(activeTab === 'night' ? styles.tabActive : {})
          }}
        >
          🌙 Night
        </button>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'all' ? styles.filterActive : {})
          }}
        >
          All Products
        </button>
        {Object.keys(categories).map(key => {
          const category = categories[key];
          const hasProducts = activeTab === 'morning' ? category.morning.length > 0 : category.night.length > 0;
          if (!hasProducts && key !== 'cleanser') return null;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              style={{
                ...styles.filterBtn,
                ...(activeFilter === key ? styles.filterActive : {})
              }}
            >
              {category.icon} {category.name}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {currentProducts.length > 0 ? (
        <div style={styles.productsGrid}>
          {currentProducts.map((product, idx) => (
            <div key={idx} style={styles.productCard}>
              <div style={styles.productIcon}>
                {product.productType?.toLowerCase().includes('cleanser') && '🧼'}
                {product.productType?.toLowerCase().includes('serum') && '💧'}
                {product.productType?.toLowerCase().includes('moisturizer') && '🧴'}
                {product.productType?.toLowerCase().includes('sunscreen') && '☀️'}
                {product.productType?.toLowerCase().includes('treatment') && '✨'}
                {product.productType?.toLowerCase().includes('mask') && '🎭'}
              </div>
              <div style={styles.productInfo}>
                <h4 style={styles.productName}>{product.productName}</h4>
                <p style={styles.productBrand}>{product.brand}</p>
                {product.description && (
                  <p style={styles.productDesc}>{product.description.substring(0, 80)}...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <p>No products found for this category</p>
          <button onClick={() => navigate('/recommendations')} style={styles.recommendBtn}>
            Get Recommendations
          </button>
        </div>
      )}

      {/* Tips Section */}
      <div style={styles.tipsCard}>
        <h3 style={styles.tipsTitle}>💡 Skincare Tips</h3>
        <div style={styles.tipsGrid}>
          <div style={styles.tipItem}>
            <span style={styles.tipIcon}>🧪</span>
            <span>Always patch test new products</span>
          </div>
          <div style={styles.tipItem}>
            <span style={styles.tipIcon}>📝</span>
            <span>Apply from thinnest to thickest</span>
          </div>
          <div style={styles.tipItem}>
            <span style={styles.tipIcon}>☀️</span>
            <span>Sunscreen every day</span>
          </div>
          <div style={styles.tipItem}>
            <span style={styles.tipIcon}>⏰</span>
            <span>Be consistent for 4-6 weeks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
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
    marginBottom: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 10
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '24px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#4A372F'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B584C',
    margin: 0
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  tab: {
    flex: 1,
    padding: '14px',
    border: 'none',
    background: 'white',
    borderRadius: '40px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#6B584C',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  tabActive: {
    background: '#D47B5C',
    color: 'white'
  },
  filterBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    padding: '8px 0'
  },
  filterBtn: {
    padding: '8px 20px',
    border: 'none',
    background: 'white',
    borderRadius: '30px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#6B584C',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  filterActive: {
    background: '#D47B5C',
    color: 'white'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    marginBottom: '30px'
  },
  productCard: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: 'white',
    borderRadius: '16px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    cursor: 'pointer'
  },
  productCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
  },
  productIcon: {
    fontSize: '32px',
    minWidth: '50px',
    height: '50px',
    background: '#FFF5F0',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: '#4A372F'
  },
  productBrand: {
    fontSize: '12px',
    color: '#A98899',
    margin: '0 0 6px 0'
  },
  productDesc: {
    fontSize: '11px',
    color: '#6B584C',
    margin: 0,
    lineHeight: '1.4'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '20px',
    marginBottom: '30px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  recommendBtn: {
    marginTop: '16px',
    padding: '10px 24px',
    background: '#D47B5C',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  tipsCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    marginTop: '10px'
  },
  tipsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: '#4A372F'
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  tipItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#6B584C',
    padding: '8px 12px',
    background: '#FFF5F0',
    borderRadius: '12px'
  },
  tipIcon: {
    fontSize: '18px'
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
    marginBottom: '15px'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '50px',
    background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 100%)',
    minHeight: '100vh'
  },
  retryBtn: {
    marginTop: '15px',
    padding: '10px 24px',
    background: '#D47B5C',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer'
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

export default Routine;