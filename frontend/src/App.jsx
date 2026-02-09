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
  },
  progressBarContainer: {
    width: '100%',
    height: '12px',
    backgroundColor: '#444',
    borderRadius: '6px',
    overflow: 'hidden',
    marginTop: '10px',
    marginBottom: '20px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#646cff',
    transition: 'width 0.3s ease-in-out',
  }
};

function App() {
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [status, setStatus] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalPages, setTotalPages] = useState(null);

  // NEW: State for tracking progress details
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });

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

  const checkPages = async () => {
    try {
      setTotalPages("Loading...");
      const res = await axios.get(`${API_URL}/pages`);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error(err);
      setTotalPages("Error");
    }
  };

  const startExtraction = async () => {
    setLoading(true);
    setStatus('STARTING');
    setData(null);
    setProgress({ current: 0, total: 0, percent: 0 }); // Reset progress

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
    setActiveTaskId(id);
    setData(null);
    setStatus('LOADING...');
    setProgress({ current: 0, total: 0, percent: 0 }); // Reset visual progress
    pollStatus(id, true); // true = run once (don't loop forever unless pending)
  };

  const pollStatus = async (id, runOnce = false) => {
    const check = async () => {
      try {
        const res = await axios.get(`${API_URL}/task/${id}`);
        const state = res.data.state;

        // Update global status state
        setStatus(state);

        // --- HANDLE PROGRESS STATE ---
        if (state === 'PROGRESS' && res.data.progress) {
            setProgress(res.data.progress);
            return false; // Return false to keep polling
        }

        // --- HANDLE FINISHED STATES ---
        if (state === 'SUCCESS') {
          setData(res.data.result);
          setLoading(false);
          // If we have result metadata, we could set progress to 100% here visually if we wanted
          setProgress({ current: 50, total: 50, percent: 100 });
          return true; // Stop polling
        } else if (state === 'FAILURE') {
          setLoading(false);
          return true; // Stop polling
        }

        return false; // Still pending/started
      } catch (err) {
        console.error(err);
        return true; // Stop on error
      }
    };

    // Initial check
    const finished = await check();

    // If not finished and we are supposed to keep polling
    if (!finished && !runOnce) {
      const interval = setInterval(async () => {
        // We must check if the user has switched tasks.
        // A robust way is to use a ref, but simple check works for this scope:
        // (If we were using a ref for activeTaskId, we'd check it here)

        const isDone = await check();
        if (isDone) clearInterval(interval);
      }, 1000); // Poll every 1 second for smoother progress bar updates
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

          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Page Count Button */}
            <button
              onClick={checkPages}
              style={{
                ...styles.button,
                backgroundColor: '#444', // Dark grey for secondary action
              }}
            >
              {totalPages ? `Pages: ${totalPages}` : '🔍 Check Page Count'}
            </button>

            {/* Extraction Button */}
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
                fontWeight: 'bold',
                color: status === 'SUCCESS' ? '#4caf50' : status === 'FAILURE' ? '#f44336' : '#ff9800'
              }}>
                {status}
              </span>
            </div>

            {/* 🟢 PROGRESS BAR SECTION 🟢 */}
            {(status === 'PROGRESS' || status === 'SUCCESS') && (
              <div style={{ marginBottom: '25px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem'}}>
                    <span>
                      {status === 'SUCCESS' ? 'Completed' : `Scraping page ${progress.current} of ${progress.total}...`}
                    </span>
                    <span>{progress.percent}%</span>
                 </div>
                 <div style={styles.progressBarContainer}>
                    <div style={{
                      ...styles.progressBarFill,
                      width: `${progress.percent}%`
                    }} />
                 </div>
              </div>
            )}

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