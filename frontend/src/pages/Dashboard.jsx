import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ todo:0, in_progress:0, done:0, overdue:0 });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/tasks/dashboard').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const cards = [
    { label:'To Do',       value: stats.todo,        color:'#6b7280' },
    { label:'In Progress', value: stats.in_progress, color:'#1d4ed8' },
    { label:'Done',        value: stats.done,        color:'#065f46' },
    { label:'Overdue',     value: stats.overdue,     color:'#dc2626' },
  ];

  return (
    <>
      <Navbar />
      <div className="container" style={{marginTop:30}}>
        <h2 style={{marginBottom:6}}>Good day, {user.name}</h2>
        <p style={{color:'#6b7280',marginBottom:24}}>Here's your task summary</p>

        <div className="stats-grid">
          {cards.map(c => (
            <div className="stat-card" key={c.label}>
              <h3 style={{color:c.color}}>{c.value}</h3>
              <p>{c.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <p style={{color:'#6b7280'}}>
            Go to <a href="/projects" style={{color:'#6d28d9',fontWeight:600}}>Projects</a> to
            view your task boards, create tasks, and manage your team.
          </p>
        </div>
      </div>
    </>
  );
}
