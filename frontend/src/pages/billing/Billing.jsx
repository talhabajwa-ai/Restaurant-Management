import { useEffect, useState } from 'react';
import { orderAPI } from '../../services/api';
import { FaPrint, FaCheck, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const response = await orderAPI.getAll({ status: 'Served' });
      setOrders(response.data.data.filter(o => o.paymentStatus !== 'Paid'));
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      await orderAPI.processPayment(selectedOrder._id, paymentMethod);
      toast.success('Payment processed successfully');
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setPaymentMethod('');
      fetchPendingOrders();
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const handlePrintBill = (order) => {
    const printWindow = window.open('', '_blank');
    const billContent = `
      <html>
        <head>
          <title>Bill - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RESTAURANT</h2>
            <p>Bill Receipt</p>
          </div>
          <p>Order: ${order.orderNumber}</p>
          <p>Table: ${order.table?.tableNumber || 'N/A'}</p>
          <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
          <hr>
          ${order.items?.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.menuItem?.name || 'Item'}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="total">
            <div class="item">
              <span>Subtotal:</span>
              <span>$${order.totalAmount?.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Tax:</span>
              <span>$${order.tax?.toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
            <div class="item">
              <span>Discount:</span>
              <span>-$${order.discount?.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="item">
              <span>TOTAL:</span>
              <span>$${order.finalAmount?.toFixed(2)}</span>
            </div>
          </div>
          <div class="center" style="margin-top: 30px;">
            <p>Thank you for dining with us!</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Billing System</h1>
        <p className="text-gray-400 mt-1">Process payments and generate bills</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Pending Payments</h2>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-400">No pending payments</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                      <p className="text-gray-400">Table {order.table?.tableNumber || 'N/A'}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary-500">
                      ${order.finalAmount?.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="border-t border-dark-600 pt-3">
                    <p className="text-sm text-gray-400 mb-2">
                      {order.items?.length} items
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrintBill(order)}
                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                      >
                        <FaPrint /> Print Bill
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPaymentModal(true);
                        }}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        <FaCheck /> Process Payment
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Bill Preview</h2>
          {selectedOrder ? (
            <div className="card">
              <div className="text-center border-b border-dark-600 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white">RESTAURANT</h3>
                <p className="text-gray-400">Bill Receipt</p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Order:</span>
                  <span className="text-white">{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Table:</span>
                  <span className="text-white">{selectedOrder.table?.tableNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Date:</span>
                  <span className="text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-dark-600 pt-4 mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-left">
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1">{item.menuItem?.name || 'Item'}</td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-dark-600 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal:</span>
                  <span className="text-white">${selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (10%):</span>
                  <span className="text-white">${selectedOrder.tax?.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Discount:</span>
                    <span className="text-red-400">-${selectedOrder.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-white border-t border-dark-600 pt-2">
                  <span>TOTAL:</span>
                  <span className="text-primary-500">${selectedOrder.finalAmount?.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-6 pt-4 border-t border-dark-600">
                <p className="text-gray-400 text-sm">Thank you for dining with us!</p>
              </div>
            </div>
          ) : (
            <div className="card text-center py-16">
              <p className="text-gray-400">Select an order to view bill</p>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Process Payment</h2>
            
            <div className="mb-6">
              <p className="text-gray-400 mb-2">Order: {selectedOrder.orderNumber}</p>
              <p className="text-3xl font-bold text-primary-500">
                ${selectedOrder.finalAmount?.toFixed(2)}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Payment Method
              </label>
              <button
                onClick={() => setPaymentMethod('Cash')}
                className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition duration-200 ${
                  paymentMethod === 'Cash'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 hover:border-dark-500'
                }`}
              >
                <FaMoneyBillWave size={24} className="text-green-400" />
                <span className="text-white font-medium">Cash</span>
              </button>
              
              <button
                onClick={() => setPaymentMethod('Card')}
                className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition duration-200 ${
                  paymentMethod === 'Card'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 hover:border-dark-500'
                }`}
              >
                <FaCreditCard size={24} className="text-blue-400" />
                <span className="text-white font-medium">Card</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentMethod('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={!paymentMethod}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;