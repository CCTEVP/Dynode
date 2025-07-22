const scrapper = {
  /**
   * Retrieves component names, animation names, and asset sources from the JSON content.
   * @param creativeId The ID of the creative to process
   * @param creativeData JSON string or object (currently unused)
   * @returns Promise<{ components: string[], libraries: string[], assets: Record<string, string[]> }>
   *          assets format: { "type-assetId": ["url1", "url2"], ... }
   */
  async getComponents(
    creativeId: string,
    creativeData: string
  ): Promise<{
    components: string[];
    libraries: string[];
    assets: Record<string, { name: string; paths: string[] }>;
  }> {
    const components = new Set<string>();
    const libraries = new Set<string>();
    const assets = new Map<string, { name: string; paths: Set<string> }>();
    const assetExtensions =
      /\.(ttf|woff2?|jpe?g|png|gif|svg|mp4|webm|ogg|mp3|wav)$/i;
    const assetPath = "http://localhost:5000/dynamics/" + creativeId + "/";

    // Helper function to determine asset type based on extension
    function getAssetType(filename: string): string {
      const imageExts = /\.(jpe?g|png|gif|svg)$/i;
      const fontExts = /\.(ttf|woff2?)$/i;
      const videoExts = /\.(mp4|webm|ogg)$/i;
      const audioExts = /\.(mp3|wav)$/i;

      if (imageExts.test(filename)) return "image";
      if (fontExts.test(filename)) return "font";
      if (videoExts.test(filename)) return "video";
      if (audioExts.test(filename)) return "audio";
      return "other";
    }

    // Helper function to add asset to the grouped structure
    function addAsset(
      assetUrl: string,
      assetId?: string,
      assetType?: string,
      assetName?: string
    ) {
      // If we have an assetId, use it for grouping
      if (assetId && assetType) {
        const groupKey = `${assetType}-${assetId}`;
        if (!assets.has(groupKey)) {
          assets.set(groupKey, {
            name: assetName || "",
            paths: new Set<string>(),
          });
        }
        // Update name if provided and current name is empty
        if (assetName && !assets.get(groupKey)!.name) {
          assets.get(groupKey)!.name = assetName;
        }
        assets.get(groupKey)!.paths.add(assetUrl);
      } else {
        // Fallback to old behavior for legacy support
        const detectedType = getAssetType(assetUrl);
        if (!assets.has(detectedType)) {
          assets.set(detectedType, {
            name: "",
            paths: new Set<string>(),
          });
        }
        assets.get(detectedType)!.paths.add(assetUrl);
      }
    }

    function recurse(obj: any) {
      if (obj && typeof obj === "object") {
        // Animation detection
        if (
          typeof obj.type === "string" &&
          (obj.type.endsWith("Layout") || obj.type.endsWith("Widget")) &&
          typeof obj.animation === "string"
        ) {
          libraries.add(
            obj.type + "/" + obj.animation.toLowerCase() + "Animation"
          );
        }
        // Asset detection for both 'source' and 'font'
        ["source", "font"].forEach((field) => {
          if (obj[field]) {
            // If field is a string (legacy support)
            if (
              typeof obj[field] === "string" &&
              assetExtensions.test(obj[field])
            ) {
              addAsset(obj[field]);
            }
            // If field is an object with paths array (current structure)
            if (
              typeof obj[field] === "object" &&
              Array.isArray(obj[field].paths)
            ) {
              // Extract asset ID, type, and name from the asset object
              const assetId = obj[field]._id;
              const assetName = obj[field].name; // Get the asset name
              const assetType = getAssetType(
                obj[field].paths[0]?.filename +
                  "." +
                  obj[field].paths[0]?.extension || ""
              );

              obj[field].paths.forEach((pathObj: any) => {
                if (
                  pathObj &&
                  typeof pathObj.filename === "string" &&
                  typeof pathObj.extension === "string" &&
                  assetExtensions.test(
                    pathObj.filename + "." + pathObj.extension
                  )
                ) {
                  const currentPath = `${assetPath}${pathObj.filename}.opt.${pathObj.extension}`;
                  addAsset(currentPath, assetId, assetType, assetName); // Pass the asset name
                }
              });
            }
          }
        });
        for (const key in obj) {
          if (key.endsWith("Layout") || key.endsWith("Widget")) {
            components.add(key);
          }
          recurse(obj[key]);
        }
      }
    }

    let json: any;
    try {
      // Fetch and parse JSON
      const response = await fetch(
        `http://localhost:3000/data/creatives/${creativeId}?children=true`
      );
      const content = await response.text();
      json = typeof content === "string" ? JSON.parse(content) : content;
      console.log(json);

      // Process and return results
      recurse(json);

      // Convert assets Map to Record<string, { name: string; paths: string[] }>
      const assetsResult: Record<string, { name: string; paths: string[] }> =
        {};
      assets.forEach((assetData, assetType) => {
        assetsResult[assetType] = {
          name: assetData.name,
          paths: Array.from(assetData.paths),
        };
      });

      console.log(
        `Scrapped ${components.size} components, ${libraries.size} libraries, and ${assets.size} asset groups.`
      );
      return {
        components: Array.from(components),
        libraries: Array.from(libraries),
        assets: assetsResult,
      };
    } catch {
      return { components: [], libraries: [], assets: {} };
    }
  },
};

export default scrapper;
