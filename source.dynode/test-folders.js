const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/dyna_content")
  .then(async () => {
    const db = mongoose.connection.db;
    console.log("Connected to database:", db.databaseName);

    const collections = await db.listCollections().toArray();
    console.log(
      "Available collections:",
      collections.map((c) => c.name).join(", "),
    );

    console.log("\n=== ALL FOLDERS ===");
    const folders = await db.collection("folders").find({}).toArray();
    console.log(`Found ${folders.length} folders`);
    folders.forEach((f) => {
      const cCount = (f.items?.creatives || []).length;
      const sCount = (f.items?.sources || []).length;
      const aCount = (f.items?.assets || []).length;
      console.log(
        `${f.name} (${f._id}): creatives=${cCount}, sources=${sCount}, assets=${aCount}, parent=${f.parent || "ROOT"}`,
      );
    });

    console.log("\n=== CREATIVES WITH FOLDER FIELD ===");
    const creativesWithFolder = await db
      .collection("creatives_dynamics")
      .find({ folder: { $exists: true } })
      .toArray();
    console.log(
      `Found ${creativesWithFolder.length} creatives with folder field`,
    );
    creativesWithFolder.forEach((c) => {
      console.log(`- ${c.name} (${c._id}): folder=${c.folder}`);
    });

    console.log("\n=== CREATIVES IN 'BEST FOR SUMMER' FOLDER ===");
    const bestForSummer = folders.find((f) => f.name === "Best for Summer");
    console.log(`Best for Summer folder ID: ${bestForSummer._id}`);
    console.log("");
    if (bestForSummer && bestForSummer.items?.creatives) {
      console.log(
        `Folder items.creatives array has ${bestForSummer.items.creatives.length} items:`,
      );
      for (let i = 0; i < bestForSummer.items.creatives.length; i++) {
        const creativeId = bestForSummer.items.creatives[i];
        const creative = await db
          .collection("creatives_dynamics")
          .findOne({ _id: creativeId });
        if (creative) {
          console.log(`\n[${i + 1}] ${creative.name}`);
          console.log(`    _id: ${creative._id}`);
          console.log(
            `    folder field (OLD system): ${creative.folder || "NONE"}`,
          );
          console.log(
            `    Match? ${creative.folder?.toString() === bestForSummer._id.toString() ? "YES" : "NO"}`,
          );
        } else {
          console.log(`\n[${i + 1}] [CREATIVE NOT FOUND] ID: ${creativeId}`);
        }
      }
    }

    console.log("\n=== COMPARISON ===");
    console.log(`"Best for Summer" folder ID:  ${bestForSummer._id}`);
    console.log(
      `"Favorites" folder ID:        ${folders.find((f) => f.name === "Favorites")?._id}`,
    );
    console.log("");
    console.log("CONCLUSION:");
    console.log(
      '- "Best for Summer" folder.items.creatives[] contains 2 creative IDs (NEW system)',
    );
    console.log(
      '- BUT both creatives have folder="Favorites" in their document (OLD system)',
    );
    console.log(
      "- This creates a dual-assignment where creatives are in TWO folders",
    );

    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
