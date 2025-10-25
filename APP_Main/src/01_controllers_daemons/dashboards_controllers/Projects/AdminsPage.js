import React, { useState } from 'react';

const AdminsPage = () => {
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@zenarth.ai',
      role: 'Super Admin',
      status: 'active',
      lastLogin: '2025-01-15 10:30:00',
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@zenarth.ai',
      role: 'Admin',
      status: 'active',
      lastLogin: '2025-01-15 09:15:00',
      permissions: ['users', 'projects', 'settings']
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@zenarth.ai',
      role: 'Admin',
      status: 'inactive',
      lastLogin: '2025-01-10 16:45:00',
      permissions: ['users', 'projects']
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'Admin',
    permissions: []
  });

  const handleAddAdmin = () => {
    if (newAdmin.name && newAdmin.email) {
      const admin = {
        id: Date.now(),
        ...newAdmin,
        status: 'active',
        lastLogin: new Date().toLocaleString()
      };
      setAdmins([...admins, admin]);
      setNewAdmin({ name: '', email: '', role: 'Admin', permissions: [] });
      setShowAddModal(false);
    }
  };

  const handleDeleteAdmin = (id) => {
    setAdmins(admins.filter(admin => admin.id !== id));
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#4facfe' : '#dc3545';
  };

  const getRoleColor = (role) => {
    return role === 'Super Admin' ? '#1f1e7a' : '#43e97b';
  };

  return (
    <div className="admins-section">
      <div className="section-header">
        <h2>Administrators</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus"></i>
          Add Admin
        </button>
      </div>

      <div className="admins-grid">
        {admins.map(admin => (
          <div key={admin.id} className="admin-card">
            <div className="admin-header">
              <div className="admin-avatar">
                {admin.name.charAt(0)}
              </div>
              <div className="admin-info">
                <h3>{admin.name}</h3>
                <p>{admin.email}</p>
              </div>
              <div className="admin-actions">
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteAdmin(admin.id)}
                  title="Delete Admin"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div className="admin-details">
              <div className="detail-row">
                <span className="label">Role:</span>
                <span 
                  className="role-badge"
                  style={{ backgroundColor: getRoleColor(admin.role) }}
                >
                  {admin.role}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="label">Status:</span>
                <span 
                  className="status-badge"
                  style={{ color: getStatusColor(admin.status) }}
                >
                  <i className={`fas fa-circle`}></i>
                  {admin.status}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="label">Last Login:</span>
                <span className="value">{admin.lastLogin}</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Permissions:</span>
                <div className="permissions">
                  {admin.permissions.map(permission => (
                    <span key={permission} className="permission-tag">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Administrator</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowAddModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="adminName">Name:</label>
                <input
                  id="adminName"
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  placeholder="Enter admin name..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="adminEmail">Email:</label>
                <input
                  id="adminEmail"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  placeholder="Enter admin email..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="adminRole">Role:</label>
                <select
                  id="adminRole"
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                >
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-add" 
                onClick={handleAddAdmin}
                disabled={!newAdmin.name || !newAdmin.email}
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admins-section {
          padding: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .section-header h2 {
          margin: 0;
          color: #333;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(31, 30, 122, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(31, 30, 122, 0.4);
        }

        .admins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .admin-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .admin-card:hover {
          transform: translateY(-2px);
        }

        .admin-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .admin-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .admin-info {
          flex: 1;
        }

        .admin-info h3 {
          margin: 0 0 0.25rem 0;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .admin-info p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .admin-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .action-btn.delete {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .admin-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .label {
          font-weight: 600;
          color: #333;
          min-width: 80px;
        }

        .value {
          color: #666;
          font-size: 0.9rem;
        }

        .role-badge, .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .status-badge {
          background: transparent;
          color: #666;
        }

        .permissions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .permission-tag {
          background: rgba(31, 30, 122, 0.1);
          color: #1f1e7a;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
          font-weight: 600;
        }

        .modal-close {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #333;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 600;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid rgba(31, 30, 122, 0.2);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1f1e7a;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .btn-cancel {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
          border: 1px solid rgba(108, 117, 125, 0.2);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: rgba(108, 117, 125, 0.2);
        }

        .btn-add {
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-add:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .admins-grid {
            grid-template-columns: 1fr;
          }
          
          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminsPage;
