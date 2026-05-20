import { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Download, 
  Search, 
  Upload, 
  MoreVertical, 
  ChevronRight,
  FileText,
  FileCheck,
  CreditCard,
  ClipboardList,
  Eye,
  Trash2,
  Edit2,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DocumentVault.css';

const DocumentVault = () => {
  const { currentUser } = useAuth();
  const [currentFolder, setCurrentFolder] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const fileInputRef = useRef(null);

  const generatorFiles = [
    { id: 1, name: 'Compliance_Cert_April.pdf', folder: 'Certificates', date: 'Apr 25, 2026', size: '1.2 MB' },
    { id: 2, name: 'Service_Agreement_2026.pdf', folder: 'Contracts', date: 'Jan 10, 2026', size: '3.5 MB' },
    { id: 3, name: 'Invoice_#1042.pdf', folder: 'Invoices', date: 'Apr 28, 2026', size: '450 KB' },
    { id: 4, name: 'Q1_Waste_Report.xlsx', folder: 'Compliance Reports', date: 'Mar 31, 2026', size: '2.8 MB' },
  ];

  const operatorFiles = [
    { id: 201, name: 'Hazardous_Waste_License.pdf', folder: 'Licenses', date: 'Feb 15, 2026', size: '2.1 MB' },
    { id: 202, name: 'Service_Contract_GreenBites.pdf', folder: 'Contracts', date: 'Apr 02, 2026', size: '1.4 MB' },
    { id: 203, name: 'Cert_Issued_PearlContinental.pdf', folder: 'Issued Certificates', date: 'Apr 26, 2026', size: '890 KB' },
    { id: 204, name: 'Environmental_Permit.pdf', folder: 'Licenses', date: 'Jan 05, 2026', size: '3.2 MB' },
  ];

  const [files, setFiles] = useState(
    currentUser?.role === 'operator' ? operatorFiles : generatorFiles
  );

  const generatorFolders = [
    { name: 'Certificates', icon: <FileCheck size={20} />, color: '#16a34a' },
    { name: 'Contracts', icon: <FileText size={20} />, color: '#2563eb' },
    { name: 'Invoices', icon: <CreditCard size={20} />, color: '#d97706' },
    { name: 'Compliance Reports', icon: <ClipboardList size={20} />, color: '#7c3aed' },
  ];

  const operatorFolders = [
    { name: 'Contracts', icon: <FileText size={20} />, color: '#2563eb' },
    { name: 'Licenses', icon: <ShieldCheck size={20} />, color: '#16a34a' },
    { name: 'Issued Certificates', icon: <Award size={20} />, color: '#0d9488' },
  ];

  const folders = currentUser?.role === 'operator' ? operatorFolders : generatorFolders;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const newFile = {
        id: Date.now(),
        name: uploadedFile.name,
        folder: currentFolder === 'All' ? 'Certificates' : currentFolder, // Default to Certificates or current folder
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: (uploadedFile.size / (1024 * 1024)).toFixed(1) + ' MB'
      };
      setFiles([newFile, ...files]);
      alert(`File "${uploadedFile.name}" uploaded successfully!`);
    }
  };

  const handleDownload = (fileName) => {
    // Simulated download
    const element = document.createElement('a');
    const file = new Blob(['Simulated file content'], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesFolder = currentFolder === 'All' || file.folder === currentFolder;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const getFolderCount = (folderName) => {
    return files.filter(f => f.folder === folderName).length;
  };

  return (
    <div className="vault-page">
      <div className="vault-header">
        <div>
          <h1>Document Vault</h1>
          <p>Securely browse and manage your compliance and financial documents.</p>
        </div>
        <button className="upload-btn" onClick={handleUploadClick}>
          <Upload size={18} /> Upload Document
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />
      </div>

      {/* FOLDER GRID */}
      <div className="folder-grid">
        <div 
          className={`folder-card ${currentFolder === 'All' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setCurrentFolder('All'); }}
        >
          <div className="folder-icon-wrapper" style={{ backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #e5e7eb' }}>
            <Folder size={24} />
          </div>
          <div className="folder-info">
            <h3>All Documents</h3>
            <span>{files.length} files</span>
          </div>
        </div>
        
        {folders.map(folder => (
          <div 
            key={folder.name} 
            className={`folder-card ${currentFolder === folder.name ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setCurrentFolder(folder.name); }}
          >
            <div className="folder-icon-wrapper" style={{ backgroundColor: `${folder.color}15`, color: folder.color }}>
              {folder.icon}
            </div>
            <div className="folder-info">
              <h3>{folder.name}</h3>
              <span>{getFolderCount(folder.name)} files</span>
            </div>
          </div>
        ))}
      </div>

      {/* FILE BROWSER SECTION */}
      <div className="file-browser">
        <div className="browser-header">
          <div className="breadcrumb">
            <span>Documents</span>
            <ChevronRight size={16} />
            <span className="current">{currentFolder}</span>
          </div>
          <div className="browser-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="file-list-container">
          <table className="file-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Date Modified</th>
                <th>Size</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length > 0 ? (
                filteredFiles.map(file => (
                  <tr key={file.id}>
                    <td>
                      <div className="file-name-cell">
                        <div className="file-icon">
                          <File size={18} />
                        </div>
                        <div>
                          <span className="file-name">{file.name}</span>
                          <span className="file-folder-tag mobile-only">{file.folder}</span>
                        </div>
                      </div>
                    </td>
                    <td>{file.date}</td>
                    <td>{file.size}</td>
                    <td className="text-right">
                      <div className="action-btns">
                        <button 
                          className="icon-btn download" 
                          title="Download"
                          onClick={() => handleDownload(file.name)}
                        >
                          <Download size={18} />
                        </button>
                        <div className="more-options-container">
                          <button 
                            className={`icon-btn ${activeMenu === file.id ? 'active' : ''}`} 
                            title="More Options"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(activeMenu === file.id ? null : file.id);
                            }}
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {activeMenu === file.id && (
                            <div className="file-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => { alert('Viewing: ' + file.name); setActiveMenu(null); }}>
                                <Eye size={14} /> View
                              </button>
                              <button onClick={() => { alert('Renaming: ' + file.name); setActiveMenu(null); }}>
                                <Edit2 size={14} /> Rename
                              </button>
                              <button className="delete-action" onClick={() => { handleDelete(file.id); setActiveMenu(null); }}>
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-browser">
                    <Search size={48} />
                    <p>No documents found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;
