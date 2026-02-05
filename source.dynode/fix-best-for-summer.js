const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/dyna_content")
  .then(async () => {
    const db = mongoose.connection.db;

    console.log(
      "Removing incorrect creative references from 'Best for Summer' folder...\n",
    );

    const result = await db
      .collection("folders")
      .updateOne(
        { name: "Best for Summer" },
        { $set: { "items.creatives": [] } },
      );

    console.log(`Updated ${result.modifiedCount} folder(s)`);

    // Verify
    const folder = await db
      .collection("folders")
      .findOne({ name: "Best for Summer" });
    console.log(
      `\nBest for Summer now has ${folder.items?.creatives?.length || 0} creatives`,
    );

    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
