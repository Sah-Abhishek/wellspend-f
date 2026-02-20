import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Well</span><span className="text-text">Spend</span>
          </Link>
          <p className="text-text-muted text-sm mt-2">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-xl p-5 border border-border space-y-4">
          {error && (
            <div className="bg-spending/10 text-spending text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-text-muted/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-text-muted/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-bg font-semibold text-sm rounded-lg hover:bg-primary-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={16} />
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <p className="text-center text-sm text-text-muted">
            No account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
