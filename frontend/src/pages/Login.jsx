import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="form-box card">
      <h2>Welcome back</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <label>Email</label>
        <input name="email" type="email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} required />
        <label>Password</label>
        <input name="password" type="password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} required />
        <button className="btn btn-primary" style={{width:'100%'}} type="submit">
          Login
        </button>
      </form>
      <p style={{marginTop:16,fontSize:14,textAlign:'center'}}>
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
