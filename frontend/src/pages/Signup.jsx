import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Signup() {
  const [form,  setForm]  = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/signup', form);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div className="form-box card">
      <h2>Create account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <label>Full Name</label>
        <input value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} required />
        <label>Email</label>
        <input type="email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} required />
        <label>Password</label>
        <input type="password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          required minLength={6} />
        <button className="btn btn-primary" style={{width:'100%'}} type="submit">
          Sign Up
        </button>
      </form>
      <p style={{marginTop:16,fontSize:14,textAlign:'center'}}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
