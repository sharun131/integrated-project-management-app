import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import GlassPanel from '../components/ui/GlassPanel';
import { Lock, Mail, User, Briefcase } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Team Member'
    });
    const { register, error, loading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050508]">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full p-10 border border-white/10 shadow-2xl relative z-10 mx-4 backdrop-blur-xl bg-[#121218]/90 rounded-3xl animate-scale-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl shadow-lg shadow-primary/20 mb-6">
                        <User className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                        Join Hub
                    </h1>
                    <p className="text-gray-400 font-medium italic">Deploy your management potential</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10" size={18} />
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full !bg-white/5 border border-white/10 text-white rounded-xl py-3.5 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder-gray-600 text-sm"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="Commander Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full !bg-white/5 border border-white/10 text-white rounded-xl py-3.5 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder-gray-600 text-sm"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="name@nexus.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Access Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10" size={18} />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full !bg-white/5 border border-white/10 text-white rounded-xl py-3.5 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder-gray-600 text-sm"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Operational Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10" size={18} />
                                <select
                                    name="role"
                                    className="w-full !bg-white/5 border border-white/10 text-white rounded-xl py-3.5 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-sm appearance-none"
                                    style={{ paddingLeft: '3rem' }}
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option className="bg-[#121218]" value="Team Member">Team Member</option>
                                    <option className="bg-[#121218]" value="Team Lead">Team Lead</option>
                                    <option className="bg-[#121218]" value="Project Manager">Project Manager</option>
                                    <option className="bg-[#121218]" value="Project Admin">Project Admin</option>
                                    <option className="bg-[#121218]" value="Super Admin">Super Admin</option>
                                    <option className="bg-[#121218]" value="Client">Client</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group bg-primary hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Initializing...' : 'Authorize Access'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <p className="text-gray-500 text-sm">
                        Already have access?{' '}
                        <Link to="/login" className="text-primary hover:text-white font-bold transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};


export default Register;
