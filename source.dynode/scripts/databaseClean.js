const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const mongoURI = process.env.MONGO_URI;

async function resetDatabase() {
  const client = new MongoClient(mongoURI);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");

    // Group collections by database
    const collectionsDir = path.join(__dirname, "../data/collections");
    const databaseCollections = new Map();

    if (fs.existsSync(collectionsDir)) {
      const collectionFiles = fs
        .readdirSync(collectionsDir)
        .filter((file) => file.endsWith(".json"));

      for (const collectionFile of collectionFiles) {
        // Extract database and collection name from filename
        // e.g., "dyna_content.creatives_assemblies.json" -> ["dyna_content", "creatives_assemblies"]
        const matches = collectionFile.match(/^(.+)\.(.+)\.json$/);
        if (matches) {
          const [, dbName, collectionName] = matches;
          if (!databaseCollections.has(dbName)) {
            databaseCollections.set(dbName, []);
          }
          databaseCollections.get(dbName).push(collectionName);
        } else {
          console.log(`⚠ Skipping file with invalid naming: ${collectionFile}`);
        }
      }
    }

    // Group views by database
    const viewsDir = path.join(__dirname, "../data/views");
    const databaseViews = new Map();

    if (fs.existsSync(viewsDir)) {
      const viewFiles = fs
        .readdirSync(viewsDir)
        .filter((file) => file.endsWith(".json"));

      for (const viewFile of viewFiles) {
        // Extract database and view name from filename
        const matches = viewFile.match(/^(.+)\.(.+)\.json$/);
        if (matches) {
          const [, dbName, viewName] = matches;
          if (!databaseViews.has(dbName)) {
            databaseViews.set(dbName, []);
          }
          databaseViews.get(dbName).push(viewName);
        } else {
          console.log(`⚠ Skipping file with invalid naming: ${viewFile}`);
        }
      }
    }

    // Get all unique database names
    const allDatabases = new Set([
      ...databaseCollections.keys(),
      ...databaseViews.keys(),
    ]);

    console.log(
      `\nFound ${allDatabases.size} database(s) to clean: ${Array.from(allDatabases).join(", ")}\n`,
    );

    // Process each database
    for (const dbName of allDatabases) {
      console.log(`\n--- Cleaning database: ${dbName} ---`);
      const db = client.db(dbName);

      // Drop collections for this database
      const collections = databaseCollections.get(dbName) || [];
      for (const collectionName of collections) {
        try {
          await db.collection(collectionName).drop();
          console.log(`✓ Dropped collection: ${dbName}.${collectionName}`);
        } catch (error) {
          // Collection might not exist, which is fine
          if (error.code !== 26) {
            // NamespaceNotFound
            console.error(
              `✗ Error dropping ${dbName}.${collectionName}:`,
              error.message,
            );
            throw new Error(
              `Failed to drop collection ${dbName}.${collectionName}: ${error.message}`,
            );
          }
        }
      }

      // Drop views for this database
      const views = databaseViews.get(dbName) || [];
      for (const viewName of views) {
        try {
          await db.collection(viewName).drop();
          console.log(`✓ Dropped view: ${dbName}.${viewName}`);
        } catch (error) {
          // View might not exist, which is fine
          if (error.code !== 26) {
            // NamespaceNotFound
            console.error(
              `✗ Error dropping view ${dbName}.${viewName}:`,
              error.message,
            );
            throw new Error(
              `Failed to drop view ${dbName}.${viewName}: ${error.message}`,
            );
          }
        }
      }

      console.log(`✓ All collections and views dropped from ${dbName}`);

      // Drop the entire database
      await db.dropDatabase();
      console.log(`✓ Database '${dbName}' dropped successfully!`);
    }

    console.log("\n🎉 All databases reset completed!");
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

resetDatabase().catch(console.error);
