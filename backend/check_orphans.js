import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Category from './app/models/category.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const orphans = [];
  const categories = await Category.find().lean();
  for (const cat of categories) {
    if (cat.parentId) {
      const parent = categories.find(c => c._id.toString() === cat.parentId.toString());
      if (!parent) {
        orphans.push(cat);
      }
    }
  }
  
  console.log(`Found ${orphans.length} orphan categories.`);
  if (orphans.length > 0) {
    console.log('Sample orphan:', orphans[0]);
  }
  process.exit(0);
}

run();
