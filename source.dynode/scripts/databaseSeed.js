const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const mongoURI = process.env.MONGO_URI;

// Function to convert MongoDB extended JSON to proper format
function convertExtendedJSON(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertExtendedJSON);
  } else if (obj && typeof obj === "object") {
    if (obj.$oid) {
      return new ObjectId(obj.$oid);
    } else if (obj.$date) {
      return new Date(obj.$date);
    } else {
      const converted = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = convertExtendedJSON(value);
      }
      return converted;
    }
  }
  return obj;
}

async function seedDatabase() {
  const client = new MongoClient(mongoURI);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");

    // Group collections by database
    const dataDir = path.join(__dirname, "../data/collections");
    const databaseCollections = new Map();

    if (!fs.existsSync(dataDir)) {
      console.log(
        "⚠ Collections directory not found, skipping collections seeding",
      );
    } else {
      const dataFiles = fs
        .readdirSync(dataDir)
        .filter((file) => file.endsWith(".json"));

      console.log(`Found ${dataFiles.length} collection files`);

      for (const dataFile of dataFiles) {
        // Extract database and collection name from filename
        // e.g., "dyna_content.creatives_assemblies.json" -> ["dyna_content", "creatives_assemblies"]
        const matches = dataFile.match(/^(.+)\.(.+)\.json$/);
        if (matches) {
          const [, dbName, collectionName] = matches;
          if (!databaseCollections.has(dbName)) {
            databaseCollections.set(dbName, []);
          }
          databaseCollections.get(dbName).push({ dataFile, collectionName });
        } else {
          console.log(`⚠ Skipping file with invalid naming: ${dataFile}`);
        }
      }
    }

    // Group views by database
    const viewsDir = path.join(__dirname, "../data/views");
    const databaseViews = new Map();

    if (!fs.existsSync(viewsDir)) {
      console.log("⚠ Views directory not found, skipping views creation");
    } else {
      const viewFiles = fs
        .readdirSync(viewsDir)
        .filter((file) => file.endsWith(".json"));

      console.log(`Found ${viewFiles.length} view files`);

      for (const viewFile of viewFiles) {
        // Extract database and view name from filename
        const matches = viewFile.match(/^(.+)\.(.+)\.json$/);
        if (matches) {
          const [, dbName, viewName] = matches;
          if (!databaseViews.has(dbName)) {
            databaseViews.set(dbName, []);
          }
          databaseViews.get(dbName).push({ viewFile, viewName });
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
      `\nProcessing ${allDatabases.size} database(s): ${Array.from(allDatabases).join(", ")}\n`,
    );

    // Process each database
    for (const dbName of allDatabases) {
      console.log(`\n--- Processing database: ${dbName} ---`);
      const db = client.db(dbName);

      // Ensure database exists by creating a temporary collection if needed
      try {
        await db.createCollection("_temp");
        await db.collection("_temp").drop();
        console.log(`✓ Database '${dbName}' is ready`);
      } catch (error) {
        // Database/collection might already exist, which is fine
        console.log(`✓ Database '${dbName}' exists`);
      }

      // Seed collections for this database
      const collections = databaseCollections.get(dbName) || [];
      for (const { dataFile, collectionName } of collections) {
        const dataFilePath = path.join(dataDir, dataFile);

        try {
          // Read file as text and parse manually to avoid require() caching
          const fileContent = fs.readFileSync(dataFilePath, "utf8");
          const rawData = JSON.parse(fileContent);
          const data = convertExtendedJSON(rawData);

          if (data && data.length > 0) {
            await db.collection(collectionName).insertMany(data);
            console.log(
              `✓ Inserted ${data.length} documents into ${dbName}.${collectionName}`,
            );
          } else {
            console.log(`⚠ No data found in ${dataFile}`);
          }
        } catch (error) {
          console.error(`✗ Error processing ${dataFile}:`, error.message);
          throw new Error(
            `Failed to seed collection ${dbName}.${collectionName}: ${error.message}`,
          );
        }
      }

      // Create views for this database
      const views = databaseViews.get(dbName) || [];
      for (const { viewFile, viewName } of views) {
        const viewFilePath = path.join(viewsDir, viewFile);
        try {
          const fileContent = fs.readFileSync(viewFilePath, "utf8");
          const viewDefinition = JSON.parse(fileContent);

          // Use createCollection with view options instead of createView
          await db.createCollection(viewName, {
            viewOn: viewDefinition.viewOn,
            pipeline: viewDefinition.pipeline,
          });

          console.log(
            `✓ Created view: ${dbName}.${viewName} on collection: ${viewDefinition.viewOn}`,
          );
        } catch (error) {
          console.error(
            `✗ Error creating view from ${viewFile}:`,
            error.message,
          );
          throw new Error(
            `Failed to create view ${dbName}.${viewName}: ${error.message}`,
          );
        }
      }
    }

    console.log("\n🎉 All databases seeded successfully!");
  } catch (error) {
    console.error("💥 Error seeding database:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("✓ MongoDB connection closed");
  }
}

seedDatabase().catch(console.error);
