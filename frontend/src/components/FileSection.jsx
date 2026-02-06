import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, Download, Trash2, X } from 'lucide-react';

const FileSection = ({ taskId }) => {
    const { api, user } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchFiles = async () => {
        try {
            const res = await api.get(`/files/task/${taskId}`);
            setFiles(res.data.data);
        } catch (err) {
            console.error("Failed to load files", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [taskId]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('taskId', taskId);

        setUploading(true);
        try {
            await api.post('/files', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchFiles();
        } catch (err) {
            alert('File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/files/${fileId}`);
            setFiles(files.filter(f => f._id !== fileId));
        } catch (err) {
            alert('Failed to delete file');
        }
    };

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await api.get(`/files/download/${fileId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); //or any other extension
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    if (loading) return <div className="p-4 text-center text-sm text-gray-400">Loading files...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700">Attachments ({files.length})</h3>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center transition">
                    <Upload size={16} className="mr-2" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
            </div>

            <div className="space-y-3">
                {files.length === 0 ? (
                    <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                        No files uploaded yet.
                    </div>
                ) : (
                    files.map(file => (
                        <div key={file._id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm">
                            <div className="flex items-center overflow-hidden">
                                <div className="bg-blue-50 p-2 rounded mr-3 text-blue-600">
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{file.originalName}</p>
                                    <p className="text-xs text-gray-400">
                                        {(file.fileSize / 1024).toFixed(1)} KB • {file.uploadedBy.name} • {new Date(file.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleDownload(file._id, file.originalName)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition"
                                >
                                    <Download size={16} />
                                </button>
                                {(user.role === 'Super Admin' || user.id === file.uploadedBy._id) && (
                                    <button
                                        onClick={() => handleDelete(file._id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FileSection;
