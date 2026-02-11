const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = todayOrders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.finalAmount, 0);

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $nin: ['Completed', 'Cancelled'] } });
    const paidOrders = await Order.countDocuments({ paymentStatus: 'Paid' });

    const allPaidOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = allPaidOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    const activeTables = await require('../models/Table').countDocuments({ status: { $ne: 'Available' } });
    const totalTables = await require('../models/Table').countDocuments();

    const totalStaff = await require('../models/User').countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        todayStats: {
          orders: todayOrders.length,
          revenue: todayRevenue
        },
        totalStats: {
          orders: totalOrders,
          revenue: totalRevenue,
          pendingOrders,
          paidOrders
        },
        tables: {
          active: activeTables,
          total: totalTables
        },
        staff: totalStaff
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let matchStage = { paymentStatus: 'Paid' };
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        matchStage.createdAt.$lt = end;
      }
    }

    const groupStage = {
      _id: groupBy === 'month' 
        ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
        : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
      totalSales: { $sum: '$finalAmount' },
      orderCount: { $sum: 1 },
      averageOrderValue: { $avg: '$finalAmount' }
    };

    const salesData = await Order.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);

    res.json({ success: true, data: salesData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTopSellingItems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topItems = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $project: {
          _id: 1,
          name: '$menuItem.name',
          category: '$menuItem.category',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json({ success: true, data: topItems });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrderStatusStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRevenueByCategory = async (req, res) => {
  try {
    const revenueByCategory = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $group: {
          _id: '$menuItem.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({ success: true, data: revenueByCategory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};