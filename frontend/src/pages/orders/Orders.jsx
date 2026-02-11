import { useEffect, useState } from 'react';
import { orderAPI, tableAPI, menuAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await tableAPI.getAll({ status: 'Available' });
      setTables(response.data.data);
    } catch (error) {
      console.error('Failed to load tables');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll({ available: true });
      setMenuItems(response.data.data);
    } catch (error) {
      console.error('Failed to load menu items');
    }
  };

  const addItemToOrder = (menuItem) => {
    const existingItem = orderItems.find(item => item.menuItem === menuItem._id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItem === menuItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        notes: ''
      }]);
    }
  };

  const removeItemFromOrder = (menuItemId) => {
    setOrderItems(orderItems.filter(item => item.menuItem !== menuItemId));
  };

  const updateItemQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeItemFromOrder(menuItemId);
      return;
    }
    setOrderItems(orderItems.map(item =>
      item.menuItem === menuItemId ? { ...item, quantity } : item
    ));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTable || orderItems.length === 0) {
      toast.error('Please select a table and add items');
      return;
    }

    try {
      const orderData = {
        table: selectedTable,
        items: orderItems.map(item => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })),
        notes
      };

      if (editingOrder) {
        await orderAPI.update(editingOrder._id, orderData);
        toast.success('Order updated successfully');
      } else {
        await orderAPI.create(orderData);
        toast.success('Order created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchOrders();
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrders();
      fetchTables();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    try {
      await orderAPI.delete(id);
      toast.success('Order deleted successfully');
      fetchOrders();
      fetchTables();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const resetForm = () => {
    setSelectedTable('');
    setOrderItems([]);
    setNotes('');
    setEditingOrder(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Preparing': return 'bg-blue-500/20 text-blue-400';
      case 'Ready': return 'bg-purple-500/20 text-purple-400';
      case 'Served': return 'bg-cyan-500/20 text-cyan-400';
      case 'Completed': return 'bg-green-500/20 text-green-400';
      case 'Cancelled': return 'bg-red-500/20 text-red-400';
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
          <h1 className="text-3xl font-bold text-white">Order Management</h1>
          <p className="text-gray-400 mt-1">Manage customer orders</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <FaPlus />
          New Order
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.paymentStatus === 'Paid' && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                      Paid
                    </span>
                  )}
                </div>
                <p className="text-gray-400">Table {order.table?.tableNumber || 'N/A'}</p>
                <p className="text-gray-500 text-sm">
                  {order.items?.length} items • ${order.finalAmount?.toFixed(2)}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Served">Served</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                <button
                  onClick={() => handleDelete(order._id)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition duration-200"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Create New Order</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Table</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="input-field mb-4"
                  required
                >
                  <option value="">Select a table</option>
                  {tables.map((table) => (
                    <option key={table._id} value={table._id}>
                      Table {table.tableNumber} ({table.capacity} seats)
                    </option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-gray-300 mb-2">Menu Items</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {menuItems.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => addItemToOrder(item)}
                      className="p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{item.name}</span>
                        <span className="text-primary-500">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{item.category}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Order Items</label>
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {orderItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items added</p>
                  ) : (
                    orderItems.map((item) => (
                      <div key={item.menuItem} className="p-3 bg-dark-700 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{item.name}</span>
                          <span className="text-primary-500">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItemQuantity(item.menuItem, item.quantity - 1)}
                            className="w-8 h-8 bg-dark-600 rounded-lg text-white hover:bg-dark-500"
                          >
                            -
                          </button>
                          <span className="text-white w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.menuItem, item.quantity + 1)}
                            className="w-8 h-8 bg-dark-600 rounded-lg text-white hover:bg-dark-500"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItemFromOrder(item.menuItem)}
                            className="ml-auto text-red-400 hover:text-red-300"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-dark-600 pt-4 mb-4">
                  <div className="flex justify-between text-gray-400 mb-2">
                    <span>Subtotal:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 mb-2">
                    <span>Tax (10%):</span>
                    <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total:</span>
                    <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="input-field mb-4"
                  rows="3"
                />

                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!selectedTable || orderItems.length === 0}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    Create Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;