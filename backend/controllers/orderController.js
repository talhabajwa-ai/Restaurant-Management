const Order = require('../models/Order');
const Table = require('../models/Table');

exports.getAllOrders = async (req, res) => {
  try {
    const { status, date, table } = req.query;
    let query = {};

    if (status) query.status = status;
    if (table) query.table = table;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(query)
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name price')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table')
      .populate('items.menuItem')
      .populate('createdBy', 'name')
      .populate('servedBy', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { table, items, notes } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = totalAmount * 0.1;

    const order = await Order.create({
      table,
      items,
      totalAmount,
      tax,
      finalAmount: totalAmount + tax,
      createdBy: req.user._id,
      notes
    });

    await Table.findByIdAndUpdate(table, { 
      status: 'Occupied', 
      currentOrder: order._id 
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name price');

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { items, status, discount } = req.body;
    let updateData = { ...req.body };

    if (items) {
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = totalAmount * 0.1;
      updateData.totalAmount = totalAmount;
      updateData.tax = tax;
      updateData.finalAmount = totalAmount + tax - (discount || 0);
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'Completed') {
      await Table.findByIdAndUpdate(order.table, { 
        status: 'Available', 
        currentOrder: null 
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'Served' && !order.servedBy) {
      order.servedBy = req.user._id;
      await order.save();
    }

    if (status === 'Completed') {
      await Table.findByIdAndUpdate(order.table._id || order.table, { 
        status: 'Available', 
        currentOrder: null 
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus: 'Paid', 
        paymentMethod,
        status: 'Completed'
      },
      { new: true }
    )
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Table.findByIdAndUpdate(order.table._id || order.table, { 
      status: 'Available', 
      currentOrder: null 
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Table.findByIdAndUpdate(order.table, { 
      status: 'Available', 
      currentOrder: null 
    });

    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};