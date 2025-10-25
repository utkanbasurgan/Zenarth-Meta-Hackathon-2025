import React, { useState, useEffect } from 'react';
import dataService from '../../../03_datas_daemons/dataService';

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'team',
    notifications: {
      handledErrors: false,
      coveredErrors: false,
      criticalErrors: true
    }
  });

  // Load team data from dataService
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        await dataService.waitForInit();
        const allData = dataService.getAllData();
        const teamData = allData.team || [];
        
        // Filter out invalid members and ensure all have required properties
        const validMembers = teamData.filter(member => 
          member && 
          typeof member === 'object' && 
          member.id && 
          member.name
        ).map(member => ({
          ...member,
          notifications: member.notifications || {
            handledErrors: false,
            coveredErrors: false,
            criticalErrors: true
          }
        }));
        
        setTeamMembers(validMembers);
      } catch (error) {
        console.error('Error loading team data:', error);
        // Fallback to empty array if loading fails
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, []);

  const handleAddMember = async () => {
    if (newMember.name && newMember.email) {
      const member = {
        id: Date.now(),
        ...newMember
      };
      
      // Update local state
      const updatedMembers = [...teamMembers, member];
      setTeamMembers(updatedMembers);
      
      // Save to dataService
      try {
        await dataService.waitForInit();
        const allData = dataService.getAllData();
        allData.team = updatedMembers;
        await dataService.saveData();
        console.log('Team member saved successfully');
      } catch (error) {
        console.error('Error saving team member:', error);
        // Revert local state on error
        setTeamMembers(teamMembers);
      }
      
      setNewMember({ 
        name: '', 
        email: '', 
        role: 'team', 
        notifications: {
          handledErrors: false,
          coveredErrors: false,
          criticalErrors: true
        }
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteMember = async (id) => {
    const updatedMembers = teamMembers.filter(member => member.id !== id);
    setTeamMembers(updatedMembers);
    
    // Save to dataService
    try {
      await dataService.waitForInit();
      const allData = dataService.getAllData();
      allData.team = updatedMembers;
      await dataService.saveData();
      console.log('Team member deleted successfully');
    } catch (error) {
      console.error('Error deleting team member:', error);
      // Revert local state on error
      setTeamMembers(teamMembers);
    }
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? '#dc3545' : '#28a745';
  };

  const toggleNotification = async (memberId, notificationType) => {
    const updatedMembers = teamMembers.map(member => {
      if (member && member.id === memberId) {
        // Ensure member has notifications object
        const safeNotifications = member.notifications || {
          handledErrors: false,
          coveredErrors: false,
          criticalErrors: true
        };
        
        return {
          ...member,
          notifications: {
            ...safeNotifications,
            [notificationType]: !safeNotifications[notificationType]
          }
        };
      }
      return member;
    });
    
    setTeamMembers(updatedMembers);
    
    // Save to dataService
    try {
      await dataService.waitForInit();
      const allData = dataService.getAllData();
      allData.team = updatedMembers;
      await dataService.saveData();
      console.log('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert local state on error
      setTeamMembers(teamMembers);
    }
  };

  if (loading) {
    return (
      <div className="team-section">
        <div className="loading-container">
          <h2>Loading Team Members...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="team-section">
      <div className="section-header">
      <h2>Team Members</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus"></i>
          New Team Member
        </button>
      </div>

      <div className="team-grid">
        {teamMembers.map(member => {
          // Add defensive checks for member data
          if (!member || typeof member !== 'object') {
            console.warn('Invalid member data:', member);
            return null;
          }

          // Ensure member has required properties with defaults
          const safeMember = {
            id: member.id || Date.now(),
            name: member.name || 'Unknown',
            email: member.email || '',
            role: member.role || 'team',
            avatar: member.avatar || null,
            notifications: member.notifications || {
              handledErrors: false,
              coveredErrors: false,
              criticalErrors: true
            }
          };

          return (
            <div key={safeMember.id} className="member-card">
              <div className="member-header">
                <div className="member-avatar">
                  {safeMember.avatar || safeMember.name.charAt(0)}
                </div>
                <div className="member-info">
                  <h3>{safeMember.name}</h3>
                  <p>{safeMember.email}</p>
                </div>
                <div className="member-actions">
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteMember(safeMember.id)}
                    title="Remove Member"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="member-details">
                <div className="detail-row">
                  <span className="label">Role:</span>
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(safeMember.role) }}
                  >
                    {safeMember.role}
                  </span>
                </div>
                
                <div className="notifications-section">
                  <h4>Notifications:</h4>
                  <div className="notification-options">
                    <label className="notification-item">
                      <input
                        type="checkbox"
                        checked={safeMember.notifications.handledErrors}
                        onChange={() => toggleNotification(safeMember.id, 'handledErrors')}
                      />
                      <span>Handled Errors</span>
                    </label>
                    <label className="notification-item">
                      <input
                        type="checkbox"
                        checked={safeMember.notifications.coveredErrors}
                        onChange={() => toggleNotification(safeMember.id, 'coveredErrors')}
                      />
                      <span>Covered Errors</span>
                    </label>
                    <label className="notification-item">
                      <input
                        type="checkbox"
                        checked={safeMember.notifications.criticalErrors}
                        onChange={() => toggleNotification(safeMember.id, 'criticalErrors')}
                      />
                      <span>Critical Errors</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Team Member</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowAddModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="memberName">Name:</label>
                <input
                  id="memberName"
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder="Enter member name..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="memberEmail">Email:</label>
                <input
                  id="memberEmail"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder="Enter member email..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="memberRole">Role:</label>
                <select
                  id="memberRole"
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                >
                  <option value="team">Team Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notification Settings:</label>
                <div className="notification-options">
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={newMember.notifications.handledErrors}
                      onChange={(e) => setNewMember({
                        ...newMember, 
                        notifications: {
                          ...newMember.notifications, 
                          handledErrors: e.target.checked
                        }
                      })}
                    />
                    <span>Handled Errors</span>
                  </label>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={newMember.notifications.coveredErrors}
                      onChange={(e) => setNewMember({
                        ...newMember, 
                        notifications: {
                          ...newMember.notifications, 
                          coveredErrors: e.target.checked
                        }
                      })}
                    />
                    <span>Covered Errors</span>
                  </label>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={newMember.notifications.criticalErrors}
                      onChange={(e) => setNewMember({
                        ...newMember, 
                        notifications: {
                          ...newMember.notifications, 
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
                onClick={handleAddMember}
                disabled={!newMember.name || !newMember.email}
              >
                Add Member
      </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .team-section {
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

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .member-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .member-card:hover {
          transform: translateY(-2px);
        }

        .member-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .member-avatar {
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

        .member-info {
          flex: 1;
        }

        .member-info h3 {
          margin: 0 0 0.25rem 0;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .member-info p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .member-actions {
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

        .member-details {
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
          gap: 0.75rem;
          width: 100%;
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
          .team-grid {
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

export default TeamPage;