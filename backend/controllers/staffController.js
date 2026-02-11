const Staff = require('../models/Staff');
const User = require('../models/User');

exports.getAllStaff = async (req, res) => {
  try {
    const { department, role } = req.query;
    let query = {};

    if (department) query.department = department;

    const staff = await Staff.find(query)
      .populate({
        path: 'user',
        match: role ? { role } : {},
        select: 'name email role phone isActive lastLogin'
      })
      .sort({ joinDate: -1 });

    const filteredStaff = staff.filter(s => s.user !== null);

    res.json({ success: true, count: filteredStaff.length, data: filteredStaff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'name email role phone isActive lastLogin');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, role, employeeId, department, salary, shift, address, emergencyContact } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone
    });

    const staff = await Staff.create({
      user: user._id,
      employeeId,
      department,
      salary,
      shift,
      address,
      emergencyContact
    });

    const populatedStaff = await Staff.findById(staff._id)
      .populate('user', 'name email role phone isActive');

    res.status(201).json({ success: true, data: populatedStaff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { name, email, phone, role, department, salary, shift, address, emergencyContact, isActive } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (name || email || phone || role !== undefined || isActive !== undefined) {
      await User.findByIdAndUpdate(staff.user, {
        name,
        email,
        phone,
        role,
        isActive
      });
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { department, salary, shift, address, emergencyContact },
      { new: true, runValidators: true }
    ).populate('user', 'name email role phone isActive');

    res.json({ success: true, data: updatedStaff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await User.findByIdAndDelete(staff.user);
    await Staff.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addPerformance = async (req, res) => {
  try {
    const { rating, comments } = req.body;
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          performance: {
            date: new Date(),
            rating,
            comments
          }
        }
      },
      { new: true }
    ).populate('user', 'name email role phone isActive');

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};