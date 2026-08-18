const db = require('../models');

exports.list = async (req, res, next) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'full_name', 'email', 'is_active', 'last_login_at', 'created_at'],
      include: [{ model: db.Role, attributes: ['name'] }]
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      role: u.Role ? u.Role.name : 'User',
      status: u.is_active ? 'Active' : 'Inactive',
      lastLogin: u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role_id, role_name, role } = req.body;
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    let targetRole = null;
    if (role_id) {
      targetRole = await db.Role.findByPk(role_id);
    }
    if (!targetRole && (role_name || role)) {
      targetRole = await db.Role.findOne({ where: { name: role_name || role } });
    }

    if (!targetRole) return res.status(400).json({ success: false, error: { message: 'Invalid role' } });

    user.role_id = targetRole.id;
    await user.save();

    res.status(200).json({ success: true, message: 'Role updated successfully', data: { role: targetRole.name } });
  } catch (error) {
    next(error);
  }
};
