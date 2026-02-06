import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import FadeIn from '../components/ui/FadeIn';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
            {/* Background Ambient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

            <FadeIn>
                <div className="max-w-md w-full p-10 border border-white/10 shadow-2xl relative z-10 mx-4 backdrop-blur-xl bg-[#121218]/90 rounded-3xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl shadow-lg shadow-primary/30 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Lock className="text-white" size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-sm">
                            ProjectHub
                        </h1>
                        <p className="text-gray-400 font-medium">Elevate your project management</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full !bg-white/5 border border-white/10 text-white rounded-xl py-3.5 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder-gray-600 text-sm"
                                        style={{ paddingLeft: '3rem' }}
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                                    <Link to="#" className="text-[10px] text-primary hover:text-white uppercase tracking-tighter transition-colors">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full !bg-white/5 border border-white/10 text-white rounded-xl py-3.5 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder-gray-600 text-sm"
                                        style={{ paddingLeft: '3rem' }}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden group bg-primary hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            <span className={`inline-flex items-center justify-center transition-all duration-300 ${loading ? 'opacity-0 scale-90' : 'opacity-100'}`}>
                                Sign In
                            </span>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white" size={20} />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-gray-500 text-sm">
                            Don't have an account yet?{' '}
                            <Link to="/register" className="text-primary hover:text-white font-bold transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
};

export default Login;
