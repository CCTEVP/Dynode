const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const mongoURI = process.env.MONGO_URI;

async function resetDatabase() {
  const client = new MongoClient(mongoURI);

  try {
    await client.connect();
    const db = client.db("dyna_content");

    // Reset Collections
    const collectionsDir = path.join(__dirname, "../data/collections");
    if (fs.existsSync(collectionsDir)) {
      const collectionFiles = fs
        .readdirSync(collectionsDir)
        .filter((file) => file.endsWith(".json"));

      for (const collectionFile of collectionFiles) {
        // Extract collection name from filename
        // e.g., "dyna_content.creatives_assemblies.json" -> "creatives_assemblies"
        const matches = collectionFile.match(/^dyna_content\.(.+)\.json$/);
        if (matches) {
          const collectionName = matches[1];
          try {
            await db.collection(collectionName).drop();
            console.log(`✓ Dropped collection: ${collectionName}`);
          } catch (error) {
            // Collection might not exist, which is fine
            if (error.code !== 26) {
              // NamespaceNotFound
              console.error(
                `✗ Error dropping ${collectionName}:`,
                error.message
              );
            }
          }
        }
      }
    }

    // Reset Views
    const viewsDir = path.join(__dirname, "../data/views");
    if (fs.existsSync(viewsDir)) {
      const viewFiles = fs
        .readdirSync(viewsDir)
        .filter((file) => file.endsWith(".json"));

      for (const viewFile of viewFiles) {
        // Extract view name from filename
        // e.g., "dyna_content.creatives_dynamics_elements.json" -> "creatives_dynamics_elements"
        const matches = viewFile.match(/^dyna_content\.(.+)\.json$/);
        const viewName = matches
          ? matches[1]
          : path.basename(viewFile, ".json");
        try {
          await db.collection(viewName).drop();
          console.log(`✓ Dropped view: ${viewName}`);
        } catch (error) {
          // View might not exist, which is fine
          if (error.code !== 26) {
            // NamespaceNotFound
            console.error(`✗ Error dropping view ${viewName}:`, error.message);
          }
        }
      }
    }

    console.log("✓ All collections and views dropped");

    // Drop the entire database
    await db.dropDatabase();
    console.log("✓ Database 'dyna_content' dropped successfully!");

    console.log("🎉 Database reset completed!");
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

resetDatabase().catch(console.error);
