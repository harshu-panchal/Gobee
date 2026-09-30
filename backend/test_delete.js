import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Category from './app/models/category.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Create a header
  const header = await Category.create({ name: 'Test Header', slug: 'test-header', type: 'header', status: 'active' });
  console.log('Header created:', header._id);

  // Create a main category
  const main = await Category.create({ name: 'Test Main', slug: 'test-main', type: 'category', parentId: header._id, status: 'active' });
  console.log('Main created:', main._id);

  // Create a sub category
  const sub = await Category.create({ name: 'Test Sub', slug: 'test-sub', type: 'subcategory', parentId: main._id, status: 'active' });
  console.log('Sub created:', sub._id);

  console.log('Now testing deleteWithChildren...');
  const deleteWithChildren = async (parentId) => {
    const children = await Category.find({ parentId });
    console.log(`Found ${children.length} children for ${parentId}`);
    for (const child of children) {
      await deleteWithChildren(child._id);
    }
    await Category.findByIdAndDelete(parentId);
    console.log(`Deleted ${parentId}`);
  };

  await deleteWithChildren(header._id.toString());

  const remaining = await Category.find({ _id: { $in: [header._id, main._id, sub._id] } });
  console.log('Remaining docs:', remaining.length);

  process.exit(0);
}

run();
