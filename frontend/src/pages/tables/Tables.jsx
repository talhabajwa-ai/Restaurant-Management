import { useEffect, useState } from 'react';
import { tableAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaChair } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const { hasRole } = useAuth();

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    location: 'Indoor',
    status: 'Available',
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await tableAPI.getAll();
      setTables(response.data.data);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await tableAPI.update(editingTable._id, formData);
        toast.success('Table updated successfully');
      } else {
        await tableAPI.create(formData);
        toast.success('Table created successfully');
      }
      setShowModal(false);
      setEditingTable(null);
      resetForm();
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      await tableAPI.delete(id);
      toast.success('Table deleted successfully');
      fetchTables();
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location,
      status: table.status,
    });
    setShowModal(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await tableAPI.updateStatus(id, newStatus);
      toast.success('Table status updated');
      fetchTables();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      tableNumber: '',
      capacity: '',
      location: 'Indoor',
      status: 'Available',
    });
  };

  const openAddModal = () => {
    setEditingTable(null);
    resetForm();
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-500/20 text-green-400';
      case 'Occupied': return 'bg-red-500/20 text-red-400';
      case 'Reserved': return 'bg-yellow-500/20 text-yellow-400';
      case 'Cleaning': return 'bg-blue-500/20 text-blue-400';
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
          <h1 className="text-3xl font-bold text-white">Table Management</h1>
          <p className="text-gray-400 mt-1">Manage your restaurant tables</p>
        </div>
        {hasRole('admin', 'manager') && (
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <FaPlus />
            Add Table
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map((table) => (
          <div key={table._id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <FaChair size={24} className="text-primary-500" />
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(table.status)}`}>
                {table.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Table {table.tableNumber}</h3>
            <p className="text-gray-400 text-sm">{table.capacity} seats</p>
            <p className="text-gray-500 text-xs mt-1">{table.location}</p>
            
            <div className="mt-4 space-y-2">
              <select
                value={table.status}
                onChange={(e) => handleStatusChange(table._id, e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Cleaning">Cleaning</option>
              </select>
              
              {hasRole('admin', 'manager') && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(table)}
                    className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition duration-200 flex items-center justify-center gap-1"
                  >
                    <FaEdit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(table._id)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition duration-200"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingTable ? 'Edit Table' : 'Add Table'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Table Number</label>
                <input
                  type="number"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                >
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Balcony">Balcony</option>
                  <option value="Private Room">Private Room</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingTable ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;