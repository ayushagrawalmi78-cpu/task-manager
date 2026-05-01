import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/" style={{color:'white',textDecoration:'none',fontWeight:700,fontSize:18}}>
        TaskManager
      </Link>
      <div style={{display:'flex',alignItems:'center'}}>
        <Link to="/">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <span style={{marginLeft:20,color:'#a78bfa',fontWeight:600}}>{user?.name}</span>
        <button onClick={logout} className="btn btn-sm"
          style={{marginLeft:16,background:'transparent',color:'white',border:'1px solid #6d28d9'}}>
          Logout
        </button>
      </div>
    </nav>
  );
}
