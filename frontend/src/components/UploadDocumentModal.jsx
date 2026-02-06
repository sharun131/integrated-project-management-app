import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, UploadCloud, FileText } from 'lucide-react';

const UploadDocumentModal = ({ isOpen, onClose, onDocumentUploaded }) => {
    const { api } = useAuth();
    const [projects, setProjects] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [projectId, setProjectId] = useState('');
    const [file, setFile] = useState(null);
    const [tags, setTags] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchProjects = async () => {
                try {
                    const res = await api.get('/projects');
                    setProjects(res.data.data);
                    if (res.data.data.length > 0) {
                        setProjectId(res.data.data[0]._id);
                    }
                } catch (err) {
                    console.error("Failed to load projects", err);
                }
            };
            fetchProjects();
        }
    }, [isOpen, api]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a file");

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
        formData.append('tags', tags);
        formData.append('description', description);

        try {
            await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onDocumentUploaded();
            onClose();
            // Reset
            setFile(null);
            setTags('');
            setDescription('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to upload document');
        } finally {
            setUploading(false);
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

                <h2 className="text-xl font-bold mb-4 flex items-center text-blue-600">
                    <UploadCloud className="mr-2" size={24} />
                    Upload Document
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                        <select
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                        >
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:bg-blue-50 transition cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                required
                            />
                            {file ? (
                                <div className="flex items-center text-green-600">
                                    <FileText size={24} className="mr-2" />
                                    <span className="truncate max-w-[200px] text-sm font-medium">{file.name}</span>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud size={32} className="mb-2" />
                                    <span className="text-sm">Click or Drag to Upload</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="contracts, design, v1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows="2"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
                            disabled={uploading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadDocumentModal;
