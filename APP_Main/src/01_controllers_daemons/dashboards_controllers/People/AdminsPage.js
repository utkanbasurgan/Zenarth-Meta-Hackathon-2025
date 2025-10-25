import React, { useState, useEffect } from 'react';
import dataService from '../../../03_datas_daemons/dataService';

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'admin',
    notifications: {
      handledErrors: true,
      coveredErrors: true,
      criticalErrors: true
    }
  });

  // Load admins data from dataService
  useEffect(() => {
    const loadAdminsData = async () => {
      try {
        await dataService.waitForInit();
        const allData = dataService.getAllData();
        // Filter team members with admin role
        const adminMembers = (allData.team || []).filter(member => member.role === 'admin');
        setAdmins(adminMembers);
      } catch (error) {
        console.error('Error loading admins data:', error);
        // Fallback to empty array if loading fails
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };

    loadAdminsData();
  }, []);

  const handleAddAdmin = async () => {
    if (newAdmin.name && newAdmin.email) {
      const admin = {
        id: Date.now(),
        ...newAdmin
      };
      
      // Update local state
      const updatedAdmins = [...admins, admin];
      setAdmins(updatedAdmins);
      
      // Save to dataService - add to team array
      try {
        await dataService.waitForInit();
        const allData = dataService.getAllData();
        // Add new admin to team array
        allData.team = [...(allData.team || []), admin];
        await dataService.saveData();
        console.log('Admin saved successfully');
      } catch (error) {
        console.error('Error saving admin:', error);
        // Revert local state on error
        setAdmins(admins);
      }
      
      setNewAdmin({ 
        name: '', 
        email: '', 
        role: 'admin', 
        notifications: {
          handledErrors: true,
          coveredErrors: true,
          criticalErrors: true
        }
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    const updatedAdmins = admins.filter(admin => admin.id !== id);
    setAdmins(updatedAdmins);
    
    // Save to dataService - remove from team array
    try {
      await dataService.waitForInit();
      const allData = dataService.getAllData();
      // Remove admin from team array
      allData.team = (allData.team || []).filter(member => member.id !== id);
      await dataService.saveData();
      console.log('Admin deleted successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
      // Revert local state on error
      setAdmins(admins);
    }
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? '#dc3545' : '#28a745';
  };

  const toggleNotification = async (adminId, notificationType) => {
    const updatedAdmins = admins.map(admin => {
      if (admin.id === adminId) {
        return {
          ...admin,
          notifications: {
            ...admin.notifications,
            [notificationType]: !admin.notifications[notificationType]
          }
        };
      }
      return admin;
    });
    
    setAdmins(updatedAdmins);
    
    // Save to dataService
    try {
      await dataService.waitForInit();
      const allData = dataService.getAllData();
      // Update the team array with the modified admin
      allData.team = (allData.team || []).map(member => 
        member.id === adminId ? updatedAdmins.find(admin => admin.id === adminId) : member
      );
      await dataService.saveData();
      console.log('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert local state on error
      setAdmins(admins);
    }
  };

  if (loading) {
    return (
      <div className="admins-section">
        <div className="loading-container">
          <h2>Loading Administrators...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="admins-section">
      <div className="section-header">
        <h2>Administrators</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus"></i>
          New Administrator
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
              
              <div className="notifications-section">
                <h4>Notifications:</h4>
                <div className="notification-options">
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={admin.notifications.handledErrors}
                      onChange={() => toggleNotification(admin.id, 'handledErrors')}
                    />
                    <span>Handled Errors</span>
                  </label>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={admin.notifications.coveredErrors}
                      onChange={() => toggleNotification(admin.id, 'coveredErrors')}
                    />
                    <span>Covered Errors</span>
                  </label>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={admin.notifications.criticalErrors}
                      onChange={() => toggleNotification(admin.id, 'criticalErrors')}
                    />
                    <span>Critical Errors</span>
                  </label>
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
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notification Settings:</label>
                <div className="notification-options">
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={newAdmin.notifications.handledErrors}
                      onChange={(e) => setNewAdmin({
                        ...newAdmin, 
                        notifications: {
                          ...newAdmin.notifications, 
                          handledErrors: e.target.checked
                        }
                      })}
                    />
                    <span>Handled Errors</span>
                  </label>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={newAdmin.notifications.coveredErrors}
                      onChange={(e) => setNewAdmin({
                        ...newAdmin, 
                        notifications: {
                          ...newAdmin.notifications, 
                          coveredErrors: e.target.checked
                        }
                      })}
                    />
                    <span>Covered Errors</span>
                  </label>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={newAdmin.notifications.criticalErrors}
                      onChange={(e) => setNewAdmin({
                        ...newAdmin, 
                        notifications: {
                          ...newAdmin.notifications, 
                          criticalErrors: e.target.checked
                        }
                      })}
                    />
                    <span>Critical Errors</span>
                  </label>
                </div>
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

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
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
          background: linear-gradient(135deg, #007bff, #0056b3);
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
          box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
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

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .notifications-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .notifications-section h4 {
          margin: 0 0 0.75rem 0;
          color: #333;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .notification-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .notification-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: #555;
          padding: 12px 16px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .notification-item:hover {
          background: #e9ecef;
          border-color: #1f1e7a;
        }

        .notification-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #1f1e7a;
          margin: 0;
          flex-shrink: 0;
        }

        .notification-item span {
          font-weight: 500;
          color: #374151;
          flex: 1;
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
          color: white;
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
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          background-color: white;
          color: #333;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1f1e7a;
          box-shadow: 0 0 0 3px rgba(31, 30, 122, 0.1);
        }

        .form-group select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1rem;
          padding-right: 3rem;
        }

        .notification-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
          width: 100%;
        }

        .form-group select:hover {
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
