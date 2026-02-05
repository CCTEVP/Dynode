import config from "../config";
const SOURCE_API_URL = config.externalOrigins.source || ""; // updated for dual namespace config
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
    creativeData: any // Change from string to any to accept objects
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
    const assetPath = "/dynamics/" + creativeId + "/";

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
        // Component detection based on 'type' property value
        if (
          typeof obj.type === "string" &&
          (obj.type.endsWith("Layout") || obj.type.endsWith("Widget"))
        ) {
          components.add(obj.type);
        }

        // Animation detection (support string and object with type)
        if (
          typeof obj.type === "string" &&
          (obj.type.endsWith("Layout") || obj.type.endsWith("Widget"))
        ) {
          let animationType: string | undefined = undefined;
          if (typeof obj.animation === "string") {
            animationType = obj.animation;
          } else if (
            obj.animation &&
            typeof obj.animation === "object" &&
            typeof obj.animation.type === "string"
          ) {
            animationType = obj.animation.type;
          }
          if (animationType) {
            libraries.add(
              obj.type + "/" + animationType.toLowerCase() + "Animation"
            );
          }
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

        // Recurse into all properties (including legacy key-based detection)
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
      // Use the passed creativeData if it exists and has elements, otherwise fetch
      if (creativeData && (creativeData.elements || creativeData.contents)) {
        console.log("Using provided creative data for scrapping");
        json = creativeData;
      } else {
        console.log("Fetching creative data from API for scrapping");
        // Fetch and parse JSON
        const response = await fetch(
          `${SOURCE_API_URL}/data/creatives/${creativeId}?children=true`
        );
        const content = await response.text();
        json = typeof content === "string" ? JSON.parse(content) : content;
      }

      console.log("Starting to analyze creative data structure");
      console.log("Creative has elements:", !!json.elements);
      console.log("Number of elements:", json.elements?.length || 0);

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
      console.log("Components found:", Array.from(components));
      console.log("Libraries found:", Array.from(libraries));
      console.log("Assets found:", Object.keys(assetsResult));

      return {
        components: Array.from(components),
        libraries: Array.from(libraries),
        assets: assetsResult,
      };
    } catch (error) {
      console.error("Error in scrapper:", error);
      return { components: [], libraries: [], assets: {} };
    }
  },
};

export default scrapper;
