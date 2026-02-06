import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
    const { api, user } = useAuth(); // Get user
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProjectMembers, setSelectedProjectMembers] = useState([]); // Track members
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        priority: 'Medium',
        dueDate: '',
        status: 'To Do',
        assignedTo: '' // Add field
    });

    // Fetch projects for the dropdown
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

    // Update members when project changes
    useEffect(() => {
        if (formData.project && projects.length > 0) {
            const proj = projects.find(p => p._id === formData.project);
            if (proj && proj.team) {
                // Should we include the manager? Maybe.
                // Let's filter out the current user if they are the manager assigning tasks to others?
                // Or just show everyone. Let's show everyone in 'team'.
                // CAUTION: backend project structure is .team[{user: {_id, name}, role}]
                // The populate in projectController.js is: .populate('team.user', 'name')
                // So team.user is an object.
                setSelectedProjectMembers(proj.team.filter(m => m.user));
            } else {
                setSelectedProjectMembers([]);
            }
        }
    }, [formData.project, projects]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/tasks', formData);
            onTaskCreated();
            onClose();
            // Reset
            setFormData({
                title: '',
                description: '',
                project: projects[0]?._id || '',
                priority: 'Medium',
                dueDate: '',
                status: 'To Do',
                assignedTo: ''
            });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-24 pb-8 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4">Create New Task</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                        <select
                            name="project"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.project}
                            onChange={handleChange}
                        >
                            <option value="">Select a Project</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows="3"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Assignee Field - Only for Admin/Manager and when project is selected */}
                    {(['Super Admin', 'Project Manager', 'Project Admin'].includes(user?.role)) && selectedProjectMembers.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                            <select
                                name="assignedTo"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                                value={formData.assignedTo || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Team Member</option>
                                {selectedProjectMembers.map(member => (
                                    <option key={member.user._id} value={member.user._id}>
                                        {member.user.name} ({member.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

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
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
