import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/mockData';

const API_URL = 'http://localhost:5000/api';

interface FakeLoginPageProps {
  token: string;
  onCompromised: (message: string) => void;
}

const FakeLoginPage = ({ token, onCompromised }: FakeLoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.post(`${API_URL}/track/compromise`, { token });
    setTimeout(() => {
      onCompromised('You entered credentials on a fake site!');
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      {/* Fake Microsoft-style login */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-2">Sign in</h1>
        <p className="text-gray-600 text-center mb-6">to continue to your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Email or phone"
              className="pl-10 bg-gray-50 border-gray-300 text-gray-800"
              defaultValue="victim@company.com"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-800"
              defaultValue="password123"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded" />
              Keep me signed in
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            No account?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Create one!
            </a>
          </p>
        </div>

        {/* Warning banner - hidden until revealed */}
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 opacity-50">
          ⚠️ <strong>SIMULATION:</strong> This is a fake login page used for security training
        </div>
      </div>
    </div>
  );
};

export default FakeLoginPage;
