const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth, requireOwner } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { state, district, city, pincode, minRent, maxRent, bedrooms, type } = req.query;

    const where = {};
    if (state) where.state = { contains: state };
    if (district) where.district = { contains: district };
    if (city) where.city = { contains: city };
    if (pincode) where.pincode = { contains: pincode };
    if (bedrooms) where.bedrooms = Number(bedrooms);
    if (type) where.type = type;
    if (minRent || maxRent) {
      where.rent = {};
      if (minRent) where.rent.gte = Number(minRent);
      if (maxRent) where.rent.lte = Number(maxRent);
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { name: true, email: true } }, images: { orderBy: { order: 'asc' } } },
    });

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.get('/mine/all', requireAuth, requireOwner, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { ownerId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

router.get('/rented-by-me', requireAuth, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { renterId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your rentals' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: Number(req.params.id) },
      include: { owner: { select: { name: true, email: true } }, images: { orderBy: { order: 'asc' } } },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

router.post('/', requireAuth, requireOwner, upload.array('images', 20), async (req, res) => {
  try {
    const { title, description, rent, state, district, city, pincode, bedrooms, bathrooms, type } = req.body;

    if (!title || !description || !rent || !state || !district || !city || !pincode || !bedrooms || !bathrooms) {
      return res.status(400).json({ error: 'Missing required listing fields' });
    }

    const files = req.files || [];

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        rent: Number(rent),
        state,
        district,
        city,
        pincode,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        type: type === 'PG' ? 'PG' : 'RENT',
        imageUrl: files[0] ? `/uploads/${files[0].filename}` : null,
        ownerId: req.user.userId,
        images: {
          create: files.map((file, index) => ({
            url: `/uploads/${file.filename}`,
            order: index,
          })),
        },
      },
      include: { images: true },
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

router.put('/:id', requireAuth, requireOwner, upload.array('images', 20), async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: Number(req.params.id) }, include: { images: true } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "You don't own this listing" });
    }

    const { title, description, rent, state, district, city, pincode, bedrooms, bathrooms, type } = req.body;
    const files = req.files || [];
    const existingCount = listing.images.length;

    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(rent && { rent: Number(rent) }),
        ...(state && { state }),
        ...(district && { district }),
        ...(city && { city }),
        ...(pincode && { pincode }),
        ...(bedrooms && { bedrooms: Number(bedrooms) }),
        ...(bathrooms && { bathrooms: Number(bathrooms) }),
        ...(type && { type: type === 'PG' ? 'PG' : 'RENT' }),
        ...(files.length > 0 && {
          images: {
            create: files.map((file, index) => ({
              url: `/uploads/${file.filename}`,
              order: existingCount + index,
            })),
          },
        }),
      },
      include: { images: { orderBy: { order: 'asc' } } },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

router.patch('/:id/rent', requireAuth, requireOwner, async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: Number(req.params.id) } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "You don't own this listing" });
    }

    const { renterEmail } = req.body;
    if (!renterEmail) return res.status(400).json({ error: 'renterEmail is required' });

    const renter = await prisma.user.findUnique({ where: { email: renterEmail } });
    if (!renter) return res.status(404).json({ error: 'No user found with that email' });
    if (renter.role !== 'RENTER') {
      return res.status(400).json({ error: 'That user is not registered as a renter' });
    }

    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: { status: 'RENTED', renterId: renter.id },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark listing as rented' });
  }
});

router.delete('/:id', requireAuth, requireOwner, async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: Number(req.params.id) } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "You don't own this listing" });
    }

    await prisma.listing.delete({ where: { id: listing.id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;