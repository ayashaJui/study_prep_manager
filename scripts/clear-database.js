const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function clearDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📊 Found ${collections.length} collection(s)`);

    if (collections.length === 0) {
      console.log("ℹ️  Database is already empty");
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    // Display collections that will be cleared
    console.log("\n⚠️  WARNING: This will delete ALL data from:");
    collections.forEach((collection) => {
      console.log(`   - ${collection.name}`);
    });

    console.log("\n🗑️  Clearing all collections...\n");

    // Drop all collections
    let cleared = 0;
    for (const collection of collections) {
      try {
        await db.dropCollection(collection.name);
        console.log(`   ✓ Cleared: ${collection.name}`);
        cleared++;
      } catch (error) {
        console.log(`   ⚠️  Could not clear ${collection.name}:`, error.message);
      }
    }

    console.log(`\n✅ Database cleared successfully! (${cleared}/${collections.length} collections)`);

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error clearing database:", error.message);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
}

// Run the script
clearDatabase();
