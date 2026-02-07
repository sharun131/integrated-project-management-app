import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Flag } from 'lucide-react';

const CreateMilestoneModal = ({ isOpen, onClose, onMilestoneCreated }) => {
    const { api } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        project: '',
        dueDate: ''
    });

    // Fetch projects for the dropdown
    useEffect(() => {
        if (isOpen) {
            setError('');
            setSuccess(false);
            const fetchProjects = async () => {
                try {
                    const res = await api.get('/projects');
                    const fetchedProjects = res.data.data || [];
                    setProjects(fetchedProjects);
                    if (fetchedProjects.length > 0) {
                        setFormData(prev => ({ ...prev, project: fetchedProjects[0]._id }));
                    } else {
                        setError('No projects found. You need a project to create a milestone.');
                    }
                } catch (err) {
                    console.error("Failed to load projects", err);
                    setError('Failed to load projects. Please try again.');
                }
            };
            fetchProjects();
        }
    }, [isOpen, api]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.project) {
            setError('Please select a project.');
            setLoading(false);
            return;
        }

        try {
            await api.post('/milestones', formData);
            setSuccess(true);
            setTimeout(() => {
                onMilestoneCreated();
                onClose();
            }, 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to create milestone';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 pt-24 pb-8 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-scale-in border border-gray-100">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-4">
                        <Flag size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Deploy Milestone</h2>
                    <p className="text-gray-500 text-sm mt-1">Initiate a new project phase checkpoint</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3 animate-shake">
                        <X size={16} className="shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm font-medium flex items-center gap-3">
                        <Flag size={16} className="shrink-0" />
                        Milestone deployed successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Achievement Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Global Deployment Phase"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Parent Project</label>
                        <select
                            name="project"
                            required
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 bg-white"
                            value={formData.project}
                            onChange={handleChange}
                        >
                            <option value="">Select a project</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Deployment Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            required
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                            value={formData.dueDate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            {loading ? 'Processing...' : (success ? 'Initiated' : 'Deploy Phase')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMilestoneModal;
