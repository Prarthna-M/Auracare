import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const ProgressTracker = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logData, setLogData] = useState({
    skinRating: 5,
    routineCompleted: false,
    skinIssues: [],
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/progress/stats', {
        headers: { Authorization: token }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const logDailyProgress = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/progress/log',
        logData,
        { headers: { Authorization: token } }
      );
      
      alert('Progress logged successfully!');
      setLogData({
        skinRating: 5,
        routineCompleted: false,
        skinIssues: [],
        notes: ''
      });
      fetchStats();
    } catch (error) {
      console.error('Error logging progress:', error);
      alert('Failed to log progress');
    } finally {
      setSaving(false);
    }
  };

  const skinIssuesOptions = ['Acne', 'Dryness', 'Oiliness', 'Redness', 'Irritation', 'Pigmentation', 'None'];

  const toggleIssue = (issue) => {
    if (logData.skinIssues.includes(issue)) {
      setLogData({
        ...logData,
        skinIssues: logData.skinIssues.filter(i => i !== issue)
      });
    } else {
      setLogData({
        ...logData,
        skinIssues: [...logData.skinIssues, issue]
      });
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '📊';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'improving': return '#6B8C42';
      case 'declining': return '#DCAAAB';
      default: return '#D47B5C';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your progress...</p>
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
        <h1 style={styles.headerTitle}>Progress Tracker</h1>
        <p style={styles.headerSubtitle}>Track your skincare journey and see improvements over time</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div style={styles.statValue}>{stats.averageSkinRating || 0}/10</div>
            <div style={styles.statLabel}>Average Skin Rating</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📅</div>
            <div style={styles.statValue}>{stats.streak || 0} days</div>
            <div style={styles.statLabel}>Current Streak</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statValue}>{stats.routineCompletionRate || 0}%</div>
            <div style={styles.statLabel}>Routine Completion</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>{getTrendIcon(stats.skinTrend)}</div>
            <div style={{...styles.statValue, color: getTrendColor(stats.skinTrend)}}>
              {stats.skinTrend || 'neutral'}
            </div>
            <div style={styles.statLabel}>Skin Trend</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {stats && stats.progress && stats.progress.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Skin Rating Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.progress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EB" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                tick={{ fill: '#6B584C' }}
              />
              <YAxis domain={[1, 10]} tick={{ fill: '#6B584C' }} />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`${value}/10`, 'Skin Rating']}
                contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="skinRating" stroke="#D47B5C" strokeWidth={2} dot={{ fill: '#D47B5C', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Common Issues */}
      {stats && stats.commonIssues && stats.commonIssues.length > 0 && (
        <div style={styles.issuesContainer}>
          <h3 style={styles.issuesTitle}>Common Skin Issues</h3>
          <div style={styles.issuesList}>
            {stats.commonIssues.map((issue, idx) => (
              <div key={idx} style={styles.issueItem}>
                <span style={styles.issueName}>{issue.issue}</span>
                <span style={styles.issueCount}>{issue.count} days</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Log Form */}
      <div style={styles.logForm}>
        <h2 style={styles.logTitle}>Log Today's Progress</h2>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>How does your skin feel today? (1-10)</label>
          <div style={styles.ratingContainer}>
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <button
                key={num}
                onClick={() => setLogData({...logData, skinRating: num})}
                style={{
                  ...styles.ratingButton,
                  background: logData.skinRating === num ? '#D47B5C' : '#F5F0EB',
                  color: logData.skinRating === num ? 'white' : '#6B584C'
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B584C' }}>
            <input
              type="checkbox"
              checked={logData.routineCompleted}
              onChange={(e) => setLogData({...logData, routineCompleted: e.target.checked})}
              style={{ accentColor: '#D47B5C' }}
            />
            Completed today's skincare routine
          </label>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Skin issues today:</label>
          <div style={styles.issuesButtons}>
            {skinIssuesOptions.map(issue => (
              <button
                key={issue}
                onClick={() => toggleIssue(issue)}
                style={{
                  ...styles.issueButton,
                  background: logData.skinIssues.includes(issue) ? '#D47B5C' : '#F5F0EB',
                  color: logData.skinIssues.includes(issue) ? 'white' : '#6B584C'
                }}
              >
                {issue}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Notes (optional)</label>
          <textarea
            value={logData.notes}
            onChange={(e) => setLogData({...logData, notes: e.target.value})}
            placeholder="Any observations about your skin today..."
            rows={3}
            style={styles.textarea}
          />
        </div>

        <button 
          onClick={logDailyProgress} 
          disabled={saving}
          style={styles.submitButton}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {saving ? 'Saving...' : 'Log Progress'}
        </button>
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
    marginBottom: '30px'
  },
  headerTitle: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#4A372F',
    marginBottom: '8px'
  },
  headerSubtitle: {
    fontSize: '16px',
    color: '#6B584C'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '10px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#4A372F'
  },
  statLabel: {
    color: '#6B584C',
    fontSize: '14px'
  },
  chartContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#4A372F'
  },
  issuesContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  issuesTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#4A372F'
  },
  issuesList: {
    marginTop: '15px'
  },
  issueItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #FFE0D0'
  },
  issueName: {
    fontWeight: '500',
    color: '#4A372F'
  },
  issueCount: {
    color: '#A98899'
  },
  logForm: {
    background: 'white',
    padding: '30px',
    borderRadius: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  logTitle: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#4A372F'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#6B584C'
  },
  ratingContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  ratingButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  issuesButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  issueButton: {
    padding: '8px 18px',
    borderRadius: '30px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #FFE0D0',
    borderRadius: '16px',
    fontSize: '14px',
    resize: 'vertical',
    background: '#FFF9F5',
    color: '#4A372F',
    fontFamily: 'inherit'
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    background: '#D47B5C',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(212, 123, 92, 0.3)'
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
    margin: '0 auto 15px'
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

export default ProgressTracker;