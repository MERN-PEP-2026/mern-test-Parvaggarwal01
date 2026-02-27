import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit2, LogOut } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchTasks();
    }
  }, [token, navigate]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Error fetching tasks');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/tasks/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/api/tasks', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({ title: '', description: '' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error saving task');
    }
  };

  const toggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      await axios.put(`http://localhost:5000/api/tasks/${task._id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      setError('Error updating status');
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTasks();
      } catch (err) {
        setError('Error deleting task');
      }
    }
  };

  const editTask = (task) => {
    setEditingId(task._id);
    setFormData({ title: task.title, description: task.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '' });
  };

  return (
    <div>
      <div className="header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <h2>{editingId ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Task Title"
              name="title"
              value={formData.title}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Task Description (optional)"
              name="description"
              value={formData.description}
              onChange={onChange}
              rows="3"
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit">{editingId ? 'Update Task' : 'Add Task'}</button>
            {editingId && (
              <button type="button" onClick={cancelEdit} style={{ backgroundColor: '#fff', color: '#000' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Your Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks found. Add a task to get started!</p>
        ) : (
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task._id} className="task-item">
                <div className="task-content">
                  <h3 className={task.status === 'completed' ? 'completed' : ''}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={task.status === 'completed' ? 'completed' : ''}>
                      {task.description}
                    </p>
                  )}
                  <small>Status: <strong>{task.status}</strong></small>
                </div>
                <div className="task-actions">
                  <button onClick={() => toggleStatus(task)} style={{ backgroundColor: '#fff', color: '#000' }}>
                    {task.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}
                  </button>
                  <button onClick={() => editTask(task)} title="Edit" style={{ padding: '8px' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteTask(task._id)} title="Delete" style={{ padding: '8px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
