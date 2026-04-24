const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/instarental';

const CATEGORY_DATA = {
  Furniture: {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    items: [
      ['Luxury 3-Seater Sofa', 'Premium Italian leather sofa suitable for living rooms and events.', 350, 1800, 'Mumbai', ['Italian Leather', 'Solid Wood Frame', '3-Seater']],
      ['Ergonomic Office Chair', 'Adjustable office chair with lumbar support and breathable mesh.', 120, 600, 'Hyderabad', ['Lumbar Support', 'Mesh Back', 'Height Adjustable']],
      ['Foldable Study Desk', 'Compact desk for WFH and study setups.', 140, 700, 'Pune', ['Foldable', 'Storage Shelf', 'Wood Finish']],
    ],
  },
  Electronics: {
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    items: [
      ['MacBook Pro M3', 'High-performance laptop for editing, development, and design work.', 800, 4000, 'Mumbai', ['M3 Chip', '16GB RAM', '512GB SSD']],
      ['Sony Alpha A7 IV Camera', 'Full-frame mirrorless camera with lens kit for shoots.', 1200, 6000, 'Delhi', ['4K Recording', 'Dual Lens', 'Extra Battery']],
      ['4K Projector 3000 Lumens', 'Projector ideal for home theatre and presentations.', 600, 3000, 'Bengaluru', ['4K Output', '3000 Lumens', 'HDMI']],
    ],
  },
  Vehicles: {
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    items: [
      ['Royal Enfield Classic 350', 'Cruiser bike for city rides and weekend trips.', 900, 4500, 'Manali', ['Helmet Included', 'Insurance', 'Petrol']],
      ['Maruti Swift 2023', 'Comfortable city car with AC and music system.', 1500, 7500, 'Mumbai', ['5 Seater', 'AC', 'GPS']],
      ['Electric Scooter Ola S1', 'Eco-friendly scooter with long battery range.', 500, 2500, 'Bengaluru', ['120km Range', 'Fast Charging', 'Helmet Included']],
    ],
  },
  Garments: {
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    items: [
      ['Designer Bridal Lehenga', 'Premium bridal lehenga for weddings and events.', 2000, 8000, 'Jaipur', ['Size M-L', 'Dupatta Included', 'Dry Cleaned']],
      ['Men Sherwani Set Maroon', 'Royal sherwani complete set with accessories.', 1500, 6000, 'Delhi', ['Size 40-44', 'Mojari Included', 'Dry Cleaned']],
      ['Cocktail Gown Navy Blue', 'Elegant gown suitable for receptions and formal events.', 900, 3600, 'Mumbai', ['Size S-M', 'Alteration Ready', 'Premium Fabric']],
    ],
  },
  Tools: {
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    items: [
      ['Bosch Power Drill Set', 'Cordless drill kit with full accessory set.', 200, 900, 'Bengaluru', ['18V', '2 Batteries', 'Tool Bag']],
      ['Pressure Washer 2200W', 'High-pressure cleaner for home and car washing.', 350, 1500, 'Hyderabad', ['160 bar', '8m Hose', 'Nozzle Kit']],
      ['Circular Saw Kit', 'Wood and metal cutting circular saw set.', 280, 1300, 'Pune', ['1400W Motor', 'Safety Guard', 'Spare Blade']],
    ],
  },
  Sports: {
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    items: [
      ['4-Person Camping Tent', 'Water-resistant tent for trekking and outdoor stays.', 300, 1500, 'Shimla', ['4 Person', 'Rainfly', 'Quick Setup']],
      ['Badminton Set Pro', 'Rackets, net, and shuttle set for casual games.', 150, 700, 'Mumbai', ['2 Rackets', 'Portable Net', 'Carry Bag']],
      ['Cricket Complete Kit', 'Batting pads, gloves, helmet and premium bat.', 250, 1100, 'Delhi', ['Full Kit', 'All Sizes', 'Match Ready']],
    ],
  },
  Books: {
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    items: [
      ['UPSC Preparation Bundle', 'Comprehensive UPSC books set for prelims and mains.', 80, 350, 'Delhi', ['NCERT Set', 'Current Affairs', 'Previous Papers']],
      ['Engineering Semester Stack', 'Core engineering textbooks bundle for semester exams.', 90, 400, 'Pune', ['5 Subjects', 'Latest Edition', 'Highlight Notes']],
      ['Business Classics Collection', 'Top startup and leadership books collection.', 70, 300, 'Mumbai', ['10 Titles', 'Hardcover Mix', 'Reading Guide']],
    ],
  },
  Others: {
    image: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80',
    items: [
      ['Party Speaker 200W', 'Portable party speaker with Bluetooth and mic support.', 450, 2000, 'Bengaluru', ['Bluetooth', 'Mic Input', '6h Battery']],
      ['Baby Stroller Premium', 'Lightweight stroller for short-term travel needs.', 220, 950, 'Hyderabad', ['Foldable', 'Storage Basket', 'Safety Harness']],
      ['Portable AC Unit', 'Compact portable air conditioner for temporary setups.', 700, 3200, 'Chennai', ['1 Ton', 'Remote Included', 'Energy Efficient']],
    ],
  },
};

const VENDORS = [
  { name: 'Raj Verma', email: 'vendor@instarental.com', city: 'Mumbai', phone: '+91 98765 11111' },
  { name: 'Nisha Kapoor', email: 'nisha.vendor@instarental.com', city: 'Delhi', phone: '+91 98765 55551' },
  { name: 'Karan Nair', email: 'karan.vendor@instarental.com', city: 'Bengaluru', phone: '+91 98765 55552' },
  { name: 'Sanya Iyer', email: 'sanya.vendor@instarental.com', city: 'Pune', phone: '+91 98765 55553' },
];

const seedProducts = (vendors) => {
  const categoryNames = Object.keys(CATEGORY_DATA);
  const products = [];
  let vendorIdx = 0;

  categoryNames.forEach((category) => {
    CATEGORY_DATA[category].items.forEach((item, idx) => {
      const [title, description, pricePerDay, pricePerWeek, city, features] = item;
      const owner = vendors[vendorIdx % vendors.length]._id;
      vendorIdx += 1;

      products.push({
        title,
        description,
        category,
        pricePerDay,
        pricePerWeek,
        city,
        condition: idx % 2 === 0 ? 'Like New' : 'Good',
        features,
        images: [CATEGORY_DATA[category].image],
        owner,
        isAvailable: idx !== 2,
        averageRating: 4.2 + idx * 0.2,
        numReviews: 6 + idx * 4,
        totalRentals: 10 + idx * 7,
      });
    });
  });

  return products;
};

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@instarental.com',
      password: 'admin123',
      role: 'admin',
      city: 'Mumbai',
      phone: '+91 98765 00000',
    });

    // Create Vendors
    const vendors = await Promise.all(
      VENDORS.map((vendor) =>
        User.create({
          ...vendor,
          password: 'vendor123',
          role: 'vendor',
        })
      )
    );

    // Create 3 demo users
    const users = await User.insertMany([
      { name: 'Priya Sharma', email: 'priya@instarental.com', password: await bcrypt.hash('user123', 12), role: 'user', city: 'Delhi', phone: '+91 98765 22222' },
      { name: 'Arjun Singh', email: 'arjun@instarental.com', password: await bcrypt.hash('user123', 12), role: 'user', city: 'Bengaluru', phone: '+91 98765 33333' },
      { name: 'Meera Patel', email: 'meera@instarental.com', password: await bcrypt.hash('user123', 12), role: 'user', city: 'Pune', phone: '+91 98765 44444' },
    ]);

    console.log('👥 Created users');

    // Create products
    const rawProducts = seedProducts(vendors);
    const products = await Product.insertMany(rawProducts);
    console.log(`📦 Created ${products.length} products`);

    // Create sample reviews for top products
    const reviewsData = [
      { user: users[0]._id, product: products[0]._id, rating: 5, comment: 'Absolutely stunning sofa! Arrived clean and in perfect condition. Great for our event.' },
      { user: users[1]._id, product: products[0]._id, rating: 5, comment: 'Very comfortable and exactly as described. Will rent again!' },
      { user: users[2]._id, product: products[4]._id, rating: 5, comment: 'MacBook was in pristine condition. Fast delivery and great support.' },
      { user: users[0]._id, product: products[4]._id, rating: 5, comment: 'Saved me thousands vs buying. Perfect for my 2-week project!' },
      { user: users[1]._id, product: products[8]._id, rating: 5, comment: 'Bullet was an absolute beast on the mountain roads. Highly recommend!' },
      { user: users[2]._id, product: products[8]._id, rating: 4, comment: 'Great condition bike. Just wish it came with luggage bags.' },
      { user: users[0]._id, product: products[16]._id, rating: 5, comment: 'Drill worked perfectly for my renovation. Great value for money!' },
    ];

    await Review.insertMany(reviewsData);
    console.log('⭐ Created reviews');

    // Create sample bookings
    const bookingsData = [
      {
        user: users[0]._id, product: products[0]._id, owner: products[0].owner,
        startDate: new Date('2026-03-10'), endDate: new Date('2026-03-13'), totalDays: 3, totalAmount: 1050,
        status: 'completed', paymentStatus: 'paid', paymentId: 'rzp_demo_001',
      },
      {
        user: users[1]._id, product: products[5]._id, owner: products[5].owner,
        startDate: new Date('2026-04-01'), endDate: new Date('2026-04-08'), totalDays: 7, totalAmount: 5600,
        status: 'completed', paymentStatus: 'paid', paymentId: 'rzp_demo_002',
      },
      {
        user: users[2]._id, product: products[12]._id, owner: products[12].owner,
        startDate: new Date('2026-04-20'), endDate: new Date('2026-04-25'), totalDays: 5, totalAmount: 4500,
        status: 'confirmed', paymentStatus: 'paid', paymentId: 'rzp_demo_003',
      },
    ];

    await Booking.insertMany(bookingsData);
    console.log('📅 Created bookings');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('='.repeat(50));
    console.log('🔐 Login Credentials:');
    console.log('  Admin   → admin@instarental.com   / admin123');
    console.log('  Vendor  → vendor@instarental.com  / vendor123');
    console.log('  Vendor 2 → nisha.vendor@instarental.com  / vendor123');
    console.log('  Vendor 3 → karan.vendor@instarental.com  / vendor123');
    console.log('  Vendor 4 → sanya.vendor@instarental.com  / vendor123');
    console.log('  User 1  → priya@instarental.com   / user123');
    console.log('  User 2  → arjun@instarental.com   / user123');
    console.log('  User 3  → meera@instarental.com   / user123');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
