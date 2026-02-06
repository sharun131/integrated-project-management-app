import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Clock } from 'lucide-react';

const LogTimeModal = ({ isOpen, onClose, onTimeLogged }) => {
    const { api } = useAuth();
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        project: '',
        task: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: ''
    });

    // Fetch Projects on open
    useEffect(() => {
        if (isOpen) {
            const fetchProjects = async () => {
                try {
                    const res = await api.get('/projects');
                    setProjects(res.data.data);
                    if (res.data.data.length > 0) {
                        setFormData(prev => ({ ...prev, project: res.data.data[0]._id }));
                    }
                } catch (err) {
                    console.error("Failed to load projects", err);
                }
            };
            fetchProjects();
        }
    }, [isOpen, api]);

    // Fetch Tasks when Project changes
    useEffect(() => {
        if (formData.project) {
            const fetchTasks = async () => {
                try {
                    // Ideally this endpoint supports filtering by project
                    // For now fetching all and filtering client side or implementing project filter in backend logic
                    // But wait, the task list is huge. We should rely on a query param.
                    // Assuming our task controller supports filtering by ?projectId=... (which we implemented partially in dashboard, but standard list might generic)
                    // Let's check taskController.js... actually we didn't explicitly implement filter by project in getTasks.
                    // But for now let's just fetch all and filter client side for simplicity in this iteration.
                    const res = await api.get('/tasks');
                    const projectTasks = res.data.data.filter(t => t.project._id === formData.project || t.project === formData.project);
                    setTasks(projectTasks);
                    if (projectTasks.length > 0) {
                        setFormData(prev => ({ ...prev, task: projectTasks[0]._id }));
                    } else {
                        setFormData(prev => ({ ...prev, task: '' }));
                    }
                } catch (err) {
                    console.error("Failed to load tasks", err);
                }
            };
            fetchTasks();
        }
    }, [formData.project, api]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/timesheets', formData);
            onTimeLogged();
            onClose();
            // Reset form
            setFormData({
                project: projects[0]?._id || '',
                task: '',
                date: new Date().toISOString().split('T')[0],
                hours: '',
                description: ''
            });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to log time');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-24 pb-8 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Clock className="mr-2 text-primary" size={24} />
                    Log Time
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                        <select
                            name="project"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.project}
                            onChange={handleChange}
                        >
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                        <select
                            name="task"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.task}
                            onChange={handleChange}
                            disabled={tasks.length === 0}
                        >
                            {tasks.length === 0 && <option value="">No tasks in this project</option>}
                            {tasks.map(t => (
                                <option key={t._id} value={t._id}>{t.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                            <input
                                type="number"
                                name="hours"
                                required
                                min="0.1"
                                step="0.1"
                                max="24"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                                value={formData.hours}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows="2"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="What did you work on?"
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Logging...' : 'Log Time'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogTimeModal;
