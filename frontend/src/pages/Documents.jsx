import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, FileText, Download, Trash2 } from 'lucide-react';
import UploadDocumentModal from '../components/UploadDocumentModal';

const Documents = () => {
  const { api } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document from the archive?')) {
      try {
        await api.delete(`/documents/${id}`);
        fetchDocuments();
      } catch (err) {
        alert('Error deleting document');
      }
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* ================= Header ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Data Repository</h1>
          <p className="text-slate-500 font-medium mt-2 italic">
            Centralized project file management and versioning
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary shadow-xl shadow-primary/20 animate-scale-in"
        >
          <Plus size={18} />
          Upload Data
        </button>
      </div>

      {/* ================= Search ================= */}
      <div className="relative max-w-xl group animate-fade-in-up stagger-1">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
        />
        <input
          type="text"
          placeholder="Filter documents by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full !pl-11 pr-4 py-3 !bg-white/5 border border-white/10 !rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder-slate-400 shadow-sm"
        />
      </div>

      {/* ================= Documents List ================= */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/[0.02]">
              <tr className="text-slate-500 text-left">
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">File Entity</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Project Context</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Commit Date</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Operational Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredDocuments.map((doc, idx) => (
                <tr
                  key={doc._id}
                  className="hover:bg-white/[0.02] transition-colors group animate-fade-in-up"
                  style={{ animationDelay: `${(idx % 5) * 0.05 + 0.3}s` }}
                >
                  {/* File */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white group-hover:text-primary transition-colors truncate">
                          {doc.title}
                        </p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                          {doc.fileType || 'DATA PACKAGE'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="px-6 py-5">
                    <span className="text-slate-400 font-medium italic">{doc.project?.name || '—'}</span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                      {new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all">
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                          <Download size={14} />
                          Retrieve
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-500/60 hover:text-red-500 transition-colors p-1"
                        title="Delete Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="py-24 text-center animate-scale-in">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
              <FileText size={32} className="text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Repository Empty</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium italic">No data packets have been uploaded to the central archive yet.</p>
          </div>
        )}
      </div>

      {/* ================= Modal ================= */}
      {showModal && (
        <UploadDocumentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onDocumentUploaded={() => {
            setShowModal(false);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
};


export default Documents;
