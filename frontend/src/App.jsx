import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/extraction';

// --- STYLES (Dark Theme) ---
const styles = {
  container: {
    fontFamily: 'Inter, system-ui, sans-serif',
    backgroundColor: '#1a1a1a', // Dark background
    color: '#e0e0e0',           // Light text
    minHeight: '100vh',
    display: 'flex',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#252525',
    borderRight: '1px solid #333',
    padding: '20px',
    overflowY: 'auto',
  },
  main: {
    flex: 1,
    padding: '40px',
    maxWidth: '1000px',
  },
  button: {
    backgroundColor: '#646cff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  card: {
    backgroundColor: '#252525',
    padding: '20px',
    borderRadius: '12px',
    marginTop: '20px',
    border: '1px solid #333',
  },
  pre: {
    backgroundColor: '#111',
    color: '#0f0', // Matrix green for code
    padding: '15px',
    borderRadius: '8px',
    overflowX: 'auto',
    maxHeight: '600px',
    fontSize: '0.9rem',
  },
  historyItem: {
    padding: '10px',
    cursor: 'pointer',
    borderRadius: '6px',
    marginBottom: '5px',
    fontSize: '0.9rem',
    color: '#aaa',
  },
  activeItem: {
    backgroundColor: '#646cff33', // faint blue bg
    color: '#fff',
    fontWeight: 'bold',
  }
};

function App() {
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [status, setStatus] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Fetch history on load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data.history);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const startExtraction = async () => {
    setLoading(true);
    setStatus('STARTING');
    setData(null);
    try {
      const res = await axios.post(`${API_URL}/extract`);
      const newId = res.data.task_id;

      setActiveTaskId(newId);
      setStatus('QUEUED');

      // Refresh history immediately so the new task appears
      fetchHistory();
      pollStatus(newId);
    } catch (err) {
      console.error(err);
      setStatus('ERROR STARTING');
      setLoading(false);
    }
  };

  const selectTask = (id) => {
    // If user clicks an old task, we just fetch its status/result once
    setActiveTaskId(id);
    setData(null);
    setStatus('LOADING...');
    pollStatus(id, true); // true = run once (don't loop forever unless pending)
  };

  const pollStatus = async (id, runOnce = false) => {
    const check = async () => {
      try {
        const res = await axios.get(`${API_URL}/task/${id}`);
        const state = res.data.state;

        // Only update state if this is still the active task the user is looking at
        setStatus(state);

        if (state === 'SUCCESS') {
          setData(res.data.result);
          setLoading(false);
          return true; // Finished
        } else if (state === 'FAILURE') {
          setLoading(false);
          return true; // Finished
        }
        return false; // Still running
      } catch (err) {
        console.error(err);
        return true; // Stop on error
      }
    };

    // Initial check
    const finished = await check();

    // If we are starting a new task, or the selected task is still pending, keep polling
    if (!finished && !runOnce) {
      const interval = setInterval(async () => {
        const isDone = await check();
        if (isDone) clearInterval(interval);
      }, 2000);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar History */}
      <div style={styles.sidebar}>
        <h3 style={{ color: '#fff', marginTop: 0 }}>📜 History</h3>
        {history.length === 0 && <p style={{color: '#666'}}>No tasks yet.</p>}
        {history.map((id) => (
          <div
            key={id}
            style={{
              ...styles.historyItem,
              ...(id === activeTaskId ? styles.activeItem : {})
            }}
            onClick={() => selectTask(id)}
          >
            {id.slice(0, 8)}...
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0 }}>📚 Torc Scraper</h1>
          <button
            onClick={startExtraction}
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : '+ New Extraction Task'}
          </button>
        </div>

        {activeTaskId ? (
          <div style={styles.card}>
            <div style={{ borderBottom: '1px solid #444', paddingBottom: '15px', marginBottom: '15px' }}>
              <strong style={{ color: '#888' }}>TASK ID:</strong>
              <span style={{ marginLeft: '10px', fontFamily: 'monospace' }}>{activeTaskId}</span>
              <br/>
              <strong style={{ color: '#888' }}>STATUS:</strong>
              <span style={{
                marginLeft: '10px',
                color: status === 'SUCCESS' ? '#4caf50' : status === 'FAILURE' ? '#f44336' : '#ff9800'
              }}>
                {status}
              </span>
            </div>

            {data && (
              <div>
                <h4 style={{ marginTop: 0 }}>Results ({data.length} items):</h4>
                <pre style={styles.pre}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            Select a task from history or start a new one.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;