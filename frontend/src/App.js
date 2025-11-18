import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [apiStatus, setApiStatus] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(uuidv4());

  const checkApiHealth = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081';
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        const data = await response.text();
        if (data.toLowerCase().includes('healthy')) {
          setApiStatus('Backend API is healthy!');
        } else {
          setApiStatus(`Backend API is unhealthy. Response: ${data}`);
        }
      } else {
        setApiStatus(`Error: Backend API returned status ${response.status}`);
      }
    } catch (error) {
      console.error('Error checking API health:', error);
      setApiStatus('Error: Could not connect to the backend API.');
    }
  };

  const addNote = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081';
    const newNote = {
      user_id: userId,
      title,
      text,
      created_at: new Date().toISOString(),
      label: 'default',
      vector_representation: [], // This will be calculated by the backend
    };

    try {
      const response = await fetch(`${apiUrl}/add_notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Note added:', data);
        setTitle('');
        setText('');
        getNotes(); // Refresh notes after adding a new one
      } else {
        console.error('Error adding note:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const getNotes = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081';
    try {
      const response = await fetch(`${apiUrl}/get_notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.payload);
      } else {
        console.error('Error fetching notes:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Click the button to check the backend API health.
        </p>
        <button onClick={checkApiHealth} className="App-button">
          Check API Health
        </button>
        {apiStatus && <p>{apiStatus}</p>}
        <div>
          <h2>Notes</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={addNote}>Add Note</button>
          <button onClick={getNotes}>Get Notes</button>
          <ul>
            {notes.map((note) => (
              <li key={note.note_id}>
                <h3>{note.title}</h3>
                <p>{note.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
