const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const mongoURI = process.env.MONGO_URI_PROD;

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

    const db = client.db("dyna_content");

    // Ensure database exists by creating a temporary collection if needed
    try {
      await db.createCollection("_temp");
      await db.collection("_temp").drop();
      console.log("✓ Database 'dyna_content' is ready");
    } catch (error) {
      // Database/collection might already exist, which is fine
      console.log("✓ Database 'dyna_content' exists");
    }

    const dataDir = path.join(__dirname, "../data/collections");

    if (!fs.existsSync(dataDir)) {
      console.log(
        "⚠ Collections directory not found, skipping collections seeding"
      );
    } else {
      const dataFiles = fs
        .readdirSync(dataDir)
        .filter((file) => file.endsWith(".json"));

      console.log(`Found ${dataFiles.length} collection files`);

      for (const dataFile of dataFiles) {
        // Extract collection name from filename
        // e.g., "dyna_content.creatives_assemblies.json" -> "creatives_assemblies"
        const matches = dataFile.match(/^dyna_content\.(.+)\.json$/);
        if (matches) {
          const collectionName = matches[1];
          const dataFilePath = path.join(dataDir, dataFile);

          try {
            // Read file as text and parse manually to avoid require() caching
            const fileContent = fs.readFileSync(dataFilePath, "utf8");
            const rawData = JSON.parse(fileContent);
            const data = convertExtendedJSON(rawData);

            if (data && data.length > 0) {
              await db.collection(collectionName).insertMany(data);
              console.log(
                `✓ Inserted ${data.length} documents into ${collectionName}`
              );
            } else {
              console.log(`⚠ No data found in ${dataFile}`);
            }
          } catch (error) {
            console.error(`✗ Error processing ${dataFile}:`, error.message);
          }
        }
      }
    }

    // Create Views from views folder
    const viewsDir = path.join(__dirname, "../data/views");
    if (!fs.existsSync(viewsDir)) {
      console.log("⚠ Views directory not found, skipping views creation");
    } else {
      const viewFiles = fs
        .readdirSync(viewsDir)
        .filter((file) => file.endsWith(".json"));

      console.log(`Found ${viewFiles.length} view files`);

      for (const viewFile of viewFiles) {
        const viewFilePath = path.join(viewsDir, viewFile);
        try {
          const fileContent = fs.readFileSync(viewFilePath, "utf8");
          const viewDefinition = JSON.parse(fileContent);

          // Extract view name from filename
          // e.g., "dyna_content.creatives_dynamics_elements.json" -> "creatives_dynamics_elements"
          const matches = viewFile.match(/^dyna_content\.(.+)\.json$/);
          const viewName = matches
            ? matches[1]
            : path.basename(viewFile, ".json");

          // Use createCollection with view options instead of createView
          await db.createCollection(viewName, {
            viewOn: viewDefinition.viewOn,
            pipeline: viewDefinition.pipeline,
          });

          console.log(
            `✓ Created view: ${viewName} on collection: ${viewDefinition.viewOn}`
          );
        } catch (error) {
          console.error(
            `✗ Error creating view from ${viewFile}:`,
            error.message
          );
        }
      }
    }

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("💥 Error seeding database:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("✓ MongoDB connection closed");
  }
}

seedDatabase().catch(console.error);
