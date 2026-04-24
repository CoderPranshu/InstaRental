const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, city, minPrice, maxPrice, page = 1, limit = 12, sort = '-createdAt' } = req.query;

  const query = {};

  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (city) query.city = { $regex: city, $options: 'i' };
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('owner', 'name email avatar city')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    products,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('owner', 'name email avatar city phone');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @desc    Create product (Vendor only)
// @route   POST /api/products
// @access  Private/Vendor
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, category, pricePerDay, pricePerWeek, city, condition, features } = req.body;

  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((f) => {
      // Cloudinary returns a URL in f.path; local disk returns an absolute path
      if (f.path && f.path.startsWith('http')) return f.path;
      // For local storage: return a relative path that the server will serve statically
      return `/uploads/${f.filename}`;
    });
  }

  const product = await Product.create({
    title,
    description,
    category,
    pricePerDay: Number(pricePerDay),
    pricePerWeek: Number(pricePerWeek) || 0,
    images,
    owner: req.user._id,
    city,
    condition,
    features: features ? JSON.parse(features) : [],
  });

  res.status(201).json(product);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Vendor
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  const { title, description, category, pricePerDay, pricePerWeek, city, condition, features, isAvailable } = req.body;

  product.title = title || product.title;
  product.description = description || product.description;
  product.category = category || product.category;
  product.pricePerDay = pricePerDay ? Number(pricePerDay) : product.pricePerDay;
  product.pricePerWeek = pricePerWeek ? Number(pricePerWeek) : product.pricePerWeek;
  product.city = city || product.city;
  product.condition = condition || product.condition;
  product.features = features ? JSON.parse(features) : product.features;
  if (isAvailable !== undefined) product.isAvailable = isAvailable === 'true';

  if (req.files && req.files.length > 0) {
    product.images = req.files.map((f) => {
      if (f.path && f.path.startsWith('http')) return f.path;
      return `/uploads/${f.filename}`;
    });
  }

  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Vendor
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  await product.deleteOne();
  res.json({ message: 'Product removed successfully' });
});

// @desc    Get vendor's own products
// @route   GET /api/products/my
// @access  Private/Vendor
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ owner: req.user._id }).sort('-createdAt');
  res.json(products);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isAvailable: true })
    .sort('-averageRating -totalRentals')
    .limit(8)
    .populate('owner', 'name avatar');
  res.json(products);
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getMyProducts, getFeaturedProducts };
