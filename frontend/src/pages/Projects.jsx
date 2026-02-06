import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Calendar, Users, MoreVertical, Briefcase, Clock, CheckCircle, Trash2, UserPlus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal';
import AssignTeamModal from '../components/AssignTeamModal';
import PageHeader from '../components/PageHeader';

const Projects = () => {
    const { api, user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteProject = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('PROTOCOL ALERT: Permanent deletion of this node will purge all associated telemetry. Proceed?')) return;
        try {
            await api.delete(`/projects/${id}`);
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    const handleApproveProject = async (id, e) => {
        e.stopPropagation();
        try {
            await api.put(`/projects/${id}`, { status: 'Active' });
            fetchProjects();
            setActiveDropdown(null);
        } catch (err) {
            console.error(err);
        }
    };

    const openAssignModal = (project, e) => {
        e.stopPropagation();
        setSelectedProject(project);
        setShowAssignModal(true);
        setActiveDropdown(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-primary/20 text-primary border-primary/30';
            case 'Completed': return 'bg-success/20 text-success border-success/30';
            case 'Planning': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'Pending Approval': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
            default: return 'bg-white/10 text-slate-400 border-white/10';
        }
    };

    const canManage = (project) => {
        return user.role === 'Super Admin' || project.manager?._id === user.id || project.manager === user.id;
    };

    return (
        <div className="space-y-10 pb-10" onClick={() => setActiveDropdown(null)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
                <PageHeader
                    title="System Projects"
                    subtitle="Centralized management of your project lifecycle"
                />
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary shadow-xl shadow-primary/20 animate-scale-in"
                >
                    <Plus size={20} />
                    <span>New Project</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative animate-fade-in-up stagger-1 group max-w-xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Filter projects by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full !pl-12 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-400 shadow-sm"
                />
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project, index) => (
                    <div
                        key={project._id}
                        className={`glass-card p-8 flex flex-col justify-between cursor-pointer group animate-fade-in-up stagger-${(index % 4) + 1} relative`}
                        onClick={() => navigate(`/projects/${project._id}`)}
                    >
                        <div>
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary transition-all duration-300 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/40">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg group-hover:text-primary transition-colors">{project.name}</h3>
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-0.5">#{project._id.slice(-6)}</p>
                                    </div>
                                </div>

                                {canManage(project) && (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === project._id ? null : project._id);
                                            }}
                                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                                        >
                                            <MoreVertical size={16} className="text-slate-500" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeDropdown === project._id && (
                                            <div className="absolute right-0 mt-2 w-48 glass-card border-white/10 shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-right">
                                                <div className="py-2">
                                                    {(project.status === 'Planning' || project.status === 'Pending Approval') && (
                                                        <button
                                                            onClick={(e) => handleApproveProject(project._id, e)}
                                                            className="w-full px-4 py-2.5 text-xs font-bold text-success hover:bg-success/10 flex items-center gap-3 transition-colors"
                                                        >
                                                            <CheckCircle size={14} /> Approve Node
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => openAssignModal(project, e)}
                                                        className="w-full px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 flex items-center gap-3 transition-colors"
                                                    >
                                                        <UserPlus size={14} /> Assign Agents
                                                    </button>
                                                    <div className="border-t border-white/5 my-1"></div>
                                                    <button
                                                        onClick={(e) => handleDeleteProject(project._id, e)}
                                                        className="w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                                    >
                                                        <Trash2 size={14} /> Purge Project
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-slate-400 mb-8 line-clamp-2 leading-relaxed font-medium">{project.description || "No project overview provided."}</p>

                            <div className="space-y-4 mb-8 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Lifecycle</span>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        <Calendar size={14} className="mr-2 text-primary" />
                                        <span>Start Date</span>
                                    </div>
                                    <span className="text-xs font-bold text-white">
                                        {project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar Area */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Resource Load</span>
                                <span className="text-xs font-bold text-primary">65%</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 ring-1 ring-white/5 p-[1px]">
                                <div className="bg-gradient-to-r from-primary to-indigo-400 h-full rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="text-center py-24 animate-scale-in">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-white/10">
                        <Briefcase size={42} className="text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Empty Workspace</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">No results found matching your current filter. Try adjusting your search or create a new project.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary"
                    >
                        <Plus size={20} />
                        <span>Launch New Project</span>
                    </button>
                </div>
            )}

            {/* Modals */}
            {showModal && (
                <CreateProjectModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onProjectCreated={() => {
                        setShowModal(false);
                        fetchProjects();
                    }}
                />
            )}

            {showAssignModal && (
                <AssignTeamModal
                    isOpen={showAssignModal}
                    onClose={() => setShowAssignModal(false)}
                    project={selectedProject}
                    onTeamUpdated={() => {
                        fetchProjects();
                    }}
                />
            )}
        </div>
    );
};


export default Projects;
