const Message = require('../models/Message');

// POST /api/messages (public)
exports.createMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }

    const doc = await Message.create({
      name,
      email,
      phone,
      subject,
      message,
      source: req.body.source || 'website',
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error('Create message error:', err);
    res.status(500).json({ error: 'Failed to submit message' });
  }
};

// GET /api/messages (admin list)
exports.listMessages = async (req, res) => {
  try {
    const { search = '', status, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (status && ['unread', 'read'].includes(status)) {
      filters.status = status;
    }

    if (search) {
      const q = new RegExp(search.trim(), 'i');
      filters.$or = [{ name: q }, { email: q }, { subject: q }, { message: q }, { phone: q }];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Message.find(filters)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Message.countDocuments(filters),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      limit: pageSize,
    });
  } catch (err) {
    console.error('List messages error:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
};

// GET /api/messages/:id
exports.getMessageById = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id).lean();
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    console.error('Get message error:', err);
    res.status(500).json({ error: 'Failed to load message' });
  }
};

// POST /api/messages/:id/read
exports.setMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const msg = await Message.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();

    if (!msg) return res.status(404).json({ error: 'Message not found' });

    res.json(msg);
  } catch (err) {
    console.error('Update message status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// DELETE /api/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
