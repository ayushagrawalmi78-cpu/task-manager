import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/navbar';
import api from '../api';

const STATUSES = ['todo', 'in_progress', 'done'];
const STATUS_LABELS = { todo:'To Do', in_progress:'In Progress', done:'Done' };

export default function ProjectDetail() {
  const { id } = useParams();
  const [project,   setProject]   = useState(null);
  const [tasks,     setTasks]     = useState([]);
  const [members,   setMembers]   = useState([]);
  const [myRole,    setMyRole]    = useState('member');
  const [newTask,   setNewTask]   = useState({ title:'', description:'', assigned_to:'', due_date:'' });
  const [newMember, setNewMember] = useState({ email:'', role:'member' });
  const [showTask,  setShowTask]  = useState(false);
  const [showMem,   setShowMem]   = useState(false);
  const [error,     setError]     = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadAll = useCallback(async () => {
    try {
      const [pRes, tRes, mRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/?project_id=${id}`),
        api.get(`/projects/${id}/members`)
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
      setMembers(mRes.data);
      const me = mRes.data.find(m => m.id === user.id);
      if (me) setMyRole(me.role);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load project data');
      console.error('Error loading project data:', err);
    }
  }, [id, user.id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const createTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tasks/', {
        ...newTask,
        project_id:  parseInt(id),
        assigned_to: newTask.assigned_to ? parseInt(newTask.assigned_to) : null,
        due_date:    newTask.due_date || null
      });
      setNewTask({ title:'', description:'', assigned_to:'', due_date:'' });
      setShowTask(false);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/projects/${id}/members`, newMember);
      setNewMember({ email:'', role:'member' });
      setShowMem(false);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add member');
    }
  };

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status });
    loadAll();
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    loadAll();
  };

  const removeMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    await api.delete(`/projects/${id}/members/${userId}`);
    loadAll();
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'done') return false;
    const due = new Date(`${task.due_date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  if (!project) return <><Navbar /><div className="container" style={{marginTop:30}}>Loading...</div></>;

  return (
    <>
      <Navbar />
      <div className="container" style={{marginTop:30}}>
        <div className="card">
          <div className="row">
            <div style={{flex:1}}>
              <h2 style={{marginBottom:4}}>{project.name}</h2>
              <p style={{color:'#6b7280',fontSize:14}}>{project.description || 'No description'}</p>
            </div>
            {myRole === 'admin' && (
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-primary btn-sm" onClick={() => { setShowTask(!showTask); setShowMem(false); }}>
                  {showTask ? 'Cancel' : '+ Task'}
                </button>
                <button className="btn btn-sm" style={{background:'#e5e7eb'}}
                  onClick={() => { setShowMem(!showMem); setShowTask(false); }}>
                  {showMem ? 'Cancel' : '+ Member'}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        {showTask && myRole === 'admin' && (
          <div className="card">
            <h3 style={{marginBottom:16}}>New Task</h3>
            <form onSubmit={createTask}>
              <label>Title</label>
              <input value={newTask.title}
                onChange={e => setNewTask({...newTask, title:e.target.value})} required />
              <label>Description (optional)</label>
              <textarea rows={2} value={newTask.description}
                onChange={e => setNewTask({...newTask, description:e.target.value})} />
              <label>Assign To</label>
              <select value={newTask.assigned_to}
                onChange={e => setNewTask({...newTask, assigned_to:e.target.value})}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <label>Due Date (optional)</label>
              <input type="date" value={newTask.due_date}
                onChange={e => setNewTask({...newTask, due_date:e.target.value})} />
              <button className="btn btn-primary" type="submit">Create Task</button>
            </form>
          </div>
        )}

        {showMem && myRole === 'admin' && (
          <div className="card">
            <h3 style={{marginBottom:16}}>Add Member</h3>
            <form onSubmit={addMember}>
              <label>User Email (must have an account)</label>
              <input type="email" value={newMember.email}
                onChange={e => setNewMember({...newMember, email:e.target.value})} required />
              <label>Role</label>
              <select value={newMember.role}
                onChange={e => setNewMember({...newMember, role:e.target.value})}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn btn-primary" type="submit">Add Member</button>
            </form>
          </div>
        )}

        <div className="task-cols" style={{marginBottom:24}}>
          {STATUSES.map(status => (
            <div key={status}>
              <div className="col-header">
                {STATUS_LABELS[status]}
                <span style={{marginLeft:8,color:'#9ca3af',fontWeight:400,fontSize:13}}>
                  ({tasks.filter(t => t.status === status).length})
                </span>
              </div>

              {tasks.filter(t => t.status === status).map(task => (
                <div className="task-card" key={task.id}
                  style={{borderLeft: isOverdue(task) ? '3px solid #dc2626' : '3px solid #6d28d9'}}>
                  <h4>{task.title}</h4>
                  {task.description && <p>{task.description}</p>}
                  <div style={{fontSize:12,color:'#6b7280',marginBottom:8}}>
                    {task.assignee_name && <span>Assigned to {task.assignee_name}</span>}
                    {task.due_date && (
                      <span style={{marginLeft:task.assignee_name ? 10 : 0}}>
                        Due {new Date(`${task.due_date}T00:00:00`).toLocaleDateString()}
                        {isOverdue(task) && <span className="overdue-text">OVERDUE</span>}
                      </span>
                    )}
                  </div>
                  <div className="row">
                    <select value={task.status} style={{width:'auto',marginBottom:0,fontSize:12,padding:'4px 8px'}}
                      onChange={e => updateStatus(task.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    {myRole === 'admin' && (
                      <button className="btn btn-danger btn-sm"
                        onClick={() => deleteTask(task.id)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}

              {tasks.filter(t => t.status === status).length === 0 && (
                <p className="empty">No tasks</p>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{marginBottom:16}}>Team Members ({members.length})</h3>
          {members.map(m => (
            <div key={m.id} className="row"
              style={{marginBottom:10,paddingBottom:10,borderBottom:'1px solid #f3f4f6'}}>
              <div style={{flex:1}}>
                <strong>{m.name}</strong>
                <span style={{color:'#6b7280',fontSize:13,marginLeft:8}}>{m.email}</span>
              </div>
              <span className={`badge badge-${m.role}`}>{m.role}</span>
              {myRole === 'admin' && m.id !== user.id && (
                <button className="btn btn-danger btn-sm"
                  onClick={() => removeMember(m.id)}>Remove</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
