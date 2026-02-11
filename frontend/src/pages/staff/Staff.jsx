import { useEffect, useState } from 'react';
import { staffAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'waiter',
    employeeId: '',
    department: 'Service',
    salary: '',
    shift: 'Full Day',
  });

  const [performanceData, setPerformanceData] = useState({
    rating: 5,
    comments: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await staffAPI.getAll();
      setStaff(response.data.data);
    } catch (error) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        const { password, ...updateData } = formData;
        await staffAPI.update(editingStaff._id, updateData);
        toast.success('Staff updated successfully');
      } else {
        await staffAPI.create(formData);
        toast.success('Staff created successfully');
      }
      setShowModal(false);
      setEditingStaff(null);
      resetForm();
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await staffAPI.delete(id);
      toast.success('Staff deleted successfully');
      fetchStaff();
    } catch (error) {
      toast.error('Failed to delete staff');
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.user?.name || '',
      email: member.user?.email || '',
      password: '',
      phone: member.user?.phone || '',
      role: member.user?.role || 'waiter',
      employeeId: member.employeeId || '',
      department: member.department || 'Service',
      salary: member.salary || '',
      shift: member.shift || 'Full Day',
    });
    setShowModal(true);
  };

  const handleAddPerformance = async (e) => {
    e.preventDefault();
    try {
      await staffAPI.addPerformance(selectedStaff._id, performanceData);
      toast.success('Performance review added');
      setShowPerformanceModal(false);
      setSelectedStaff(null);
      setPerformanceData({ rating: 5, comments: '' });
      fetchStaff();
    } catch (error) {
      toast.error('Failed to add performance review');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'waiter',
      employeeId: '',
      department: 'Service',
      salary: '',
      shift: 'Full Day',
    });
  };

  const openAddModal = () => {
    setEditingStaff(null);
    resetForm();
    setShowModal(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-400';
      case 'manager': return 'bg-blue-500/20 text-blue-400';
      case 'cashier': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Staff Management</h1>
          <p className="text-gray-400 mt-1">Manage your restaurant staff</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <FaPlus />
          Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{member.user?.name}</h3>
                <p className="text-gray-400 text-sm">{member.user?.email}</p>
                <p className="text-gray-500 text-sm">ID: {member.employeeId}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(member.user?.role)}`}>
                {member.user?.role}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <p><span className="text-gray-500">Department:</span> {member.department}</p>
              <p><span className="text-gray-500">Shift:</span> {member.shift}</p>
              <p><span className="text-gray-500">Salary:</span> ${member.salary?.toLocaleString()}</p>
              <p><span className="text-gray-500">Joined:</span> {new Date(member.joinDate).toLocaleDateString()}</p>
            </div>

            {member.performance?.length > 0 && (
              <div className="mb-4 p-3 bg-dark-700 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Latest Performance</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={14}
                      className={i < member.performance[member.performance.length - 1].rating ? 'text-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(member)}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => {
                  setSelectedStaff(member);
                  setShowPerformanceModal(true);
                }}
                className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition duration-200"
              >
                <FaStar />
              </button>
              <button
                onClick={() => handleDelete(member._id)}
                className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition duration-200"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingStaff ? 'Edit Staff' : 'Add Staff'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              {!editingStaff && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required={!editingStaff}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-field"
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Service">Service</option>
                    <option value="Management">Management</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Salary</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Shift</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="input-field"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                  <option value="Full Day">Full Day</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingStaff ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPerformanceModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              Add Performance Review - {selectedStaff.user?.name}
            </h2>
            <form onSubmit={handleAddPerformance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPerformanceData({ ...performanceData, rating: star })}
                      className="p-2"
                    >
                      <FaStar
                        size={24}
                        className={star <= performanceData.rating ? 'text-yellow-400' : 'text-gray-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Comments</label>
                <textarea
                  value={performanceData.comments}
                  onChange={(e) => setPerformanceData({ ...performanceData, comments: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Add your comments..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPerformanceModal(false);
                    setSelectedStaff(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;