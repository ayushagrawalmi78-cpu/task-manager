import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import api from '../api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form,     setForm]     = useState({ name:'', description:'' });
  const [error,    setError]    = useState('');
  const [show,     setShow]     = useState(false);

  const load = () => api.get('/projects/').then(r => setProjects(r.data)).catch(()=>{});
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects/', form);
      setForm({ name:'', description:'' });
      setShow(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{marginTop:30}}>
        <div className="row" style={{marginBottom:20}}>
          <h2>My Projects</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShow(!show)}>
            {show ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {show && (
          <div className="card">
            <h3 style={{marginBottom:16}}>Create New Project</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={create}>
              <label>Project Name</label>
              <input value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
              <label>Description (optional)</label>
              <textarea rows={3} value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
              <button className="btn btn-primary" type="submit">Create Project</button>
            </form>
          </div>
        )}

        {projects.length === 0 && !show && (
          <div className="card">
            <p className="empty">No projects yet. Create your first project above.</p>
          </div>
        )}

        {projects.map(p => (
          <div className="card" key={p.id}>
            <div className="row">
              <div style={{flex:1}}>
                <h3 style={{marginBottom:4}}>{p.name}</h3>
                <p style={{color:'#6b7280',fontSize:14}}>{p.description || 'No description'}</p>
              </div>
              <span className={`badge badge-${p.my_role}`}>{p.my_role}</span>
              <Link to={`/projects/${p.id}`}>
                <button className="btn btn-primary btn-sm">Open</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
