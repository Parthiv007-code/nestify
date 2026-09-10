const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true, state: true, district: true, city: true, pincode: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name, state, district, city, pincode } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(state !== undefined && { state }),
        ...(district !== undefined && { district }),
        ...(city !== undefined && { city }),
        ...(pincode !== undefined && { pincode }),
      },
      select: { id: true, email: true, name: true, role: true, state: true, district: true, city: true, pincode: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;