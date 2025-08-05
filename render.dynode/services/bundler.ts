import fs from "fs";
import path from "path";
import { minify as minifyJS } from "terser";
import CleanCSS from "clean-css";
import logger from "../services/logger";

const bundler = {
  async bundleComponents(resources: {
    creativeId: string;
    routePath?: string;
    name: string;
    items:
      | string[]
      | Record<string, string[]>
      | Record<string, { name: string; paths: string[] }>;
    mode: boolean;
    extension: string;
  }): Promise<{
    payload: string;
  }> {
    const creativeId = resources.creativeId;
    const routePath = resources.routePath || "dynamics";
    const resourceName = resources.name;
    const items = resources.items;
    const mode = resources.mode;
    const extension = resources.extension;
    let response = "";

    switch (resourceName) {
      case "components":
        // Ensure items is an array for components (should always be array for components)
        const componentItems = Array.isArray(items) ? items : [];
        const compontentFilesContents = componentItems.map((item) => {
          const filePath =
            extension.toLowerCase() === "js"
              ? path.join(
                  __dirname,
                  "..",
                  "views",
                  "scripts",
                  "components",
                  item,
                  "default.js"
                )
              : path.join(
                  __dirname,
                  "..",
                  "views",
                  "components",
                  item,
                  "default.css"
                );
          if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, "utf-8");
          } else {
            console.warn(`File not found: ${filePath}`);
            return "";
          }
        });
        response = compontentFilesContents.join("\n");
        break;
      case "libraries":
        // Ensure items is an array for libraries (should always be array for libraries)
        const libraryItems = Array.isArray(items) ? items : [];
        const libraryFilesContents = libraryItems.map((item) => {
          const filePath =
            extension.toLowerCase() === "js"
              ? path.join(
                  __dirname,
                  "..",
                  "views",
                  "scripts",
                  "components",
                  item + ".js"
                )
              : path.join(
                  __dirname,
                  "..",
                  "views",
                  "components",
                  item + ".css"
                );
          if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, "utf-8");
          } else {
            console.warn(`File not found: ${filePath}`);
            return "";
          }
        });
        response = libraryFilesContents.join("\n");
        break;
      case "manager":
        const filePath = path.join(
          __dirname,
          "..",
          "views",
          "scripts",
          "pages",
          routePath,
          "default.js"
        );
        logger.info(`Bundling manager script from: ${filePath}`);

        // First get the template content
        const templateContent = await this.retrieveFileContent(resourceName, [
          { look: "{{creativeId}}", replace: creativeId },
        ]);

        // Then get the default.js content
        let defaultJsContent = "";
        if (fs.existsSync(filePath)) {
          defaultJsContent = fs.readFileSync(filePath, "utf-8");
          logger.info(
            `Successfully read default.js file, size: ${defaultJsContent.length} characters`
          );
        } else {
          console.warn(`File not found: ${filePath}`);
        }

        // Combine template + default.js content
        response = templateContent + "\n" + defaultJsContent;
        logger.info(`Combined response size: ${response.length} characters`);
        break;
      case "assets":
        // Include conditional for CSS
        if (extension.toLowerCase() === "css") {
          // Handle asset structure for CSS - assets come as grouped objects or legacy arrays
          const fontFaceRules: string[] = [];
          if (Array.isArray(items)) {
            // Legacy format: items is a flat array - group fonts by family name
            const fontGroups: Record<string, string[]> = {};

            items.forEach((url: string) => {
              // Only process font files
              if (url.includes("webfont") || /\.(woff2?|ttf|otf)$/i.test(url)) {
                const fileName = path.basename(url, path.extname(url));
                const fontFamily = fileName
                  .replace(/\.opt$/i, "")
                  .replace(/-webfont$/i, "");

                if (!fontGroups[fontFamily]) {
                  fontGroups[fontFamily] = [];
                }
                fontGroups[fontFamily].push(url);
              }
            });

            // Generate font-face rules for each group
            Object.entries(fontGroups).forEach(([fontFamily, urls]) => {
              const sources = urls
                .map((url) => {
                  const ext = path.extname(url).slice(1).replace("opt.", "");
                  return `url("${url}") format("${ext}")`;
                })
                .join(",\n    ");

              fontFaceRules.push(`@font-face {
  font-family: "${fontFamily}";
  src: ${sources};
  font-weight: normal;
  font-style: normal;
}`);
            });
          } else if (typeof items === "object" && items !== null) {
            // New grouped format: items is an object with grouped assets containing name and paths
            const assetGroups = items as Record<
              string,
              { name: string; paths: string[] }
            >;

            Object.entries(assetGroups).forEach(([groupKey, assetData]) => {
              // Only process font groups
              if (groupKey.startsWith("font-")) {
                // Use the asset name directly from the asset data
                const fontFamily = assetData.name || "Unknown Font";

                // Create source URLs for all formats of this font using the paths array
                const sources = assetData.paths
                  .map((url) => {
                    const ext = path.extname(url).slice(1).replace("opt.", "");
                    return `url("${url}") format("${ext}")`;
                  })
                  .join(",\n    ");

                fontFaceRules.push(`@font-face {
  font-family: "${fontFamily}";
  src: ${sources};
  font-weight: normal;
  font-style: normal;
}`);
              }
            });
          }

          response = fontFaceRules.join("\n\n");
        } else if (extension.toLowerCase() === "js") {
          // Handle asset structure - flatten all asset URLs from the grouped format
          let assetUrls: string[] = [];

          if (Array.isArray(items)) {
            // Legacy array format
            assetUrls = items;
          } else {
            // New grouped format with { name: string; paths: string[] }
            const assetGroups = items as Record<
              string,
              { name: string; paths: string[] }
            >;
            assetUrls = Object.values(assetGroups).flatMap(
              (assetData) => assetData.paths
            );
          }

          assetUrls.push("/dynamics/" + creativeId + "/components.js");
          assetUrls.push("/dynamics/" + creativeId + "/libraries.js");
          const filesToCache = assetUrls.map((item) => `"${item}"`).join(", ");
          const filesToExclude = "";
          response = await this.retrieveFileContent(resourceName, [
            { look: "{{creativeId}}", replace: creativeId },
            { look: '"{{filesToCache}}"', replace: filesToCache },
            { look: '"{{filesToExclude}}"', replace: filesToExclude },
          ]);
        }
        break;
      default:
        response = resourceName;
        break;
    }

    //Minify response if mode is true
    if (mode) {
      response = await this.minifyContent(response, extension);
    }

    return {
      payload: response,
    };
  },
  async retrieveFileContent(
    name: string,
    replace: { look: string; replace: string }[]
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      "..",
      "views",
      "scripts",
      name + "_template.js"
    );
    let template = fs.readFileSync(templatePath, "utf-8");
    if (replace.length > 0) {
      replace.forEach((pair) => {
        const look = pair.look;
        const replaceWith = pair.replace;
        template = template.replace(new RegExp(look, "g"), replaceWith);
      });
    }
    return template || "";
  },
  async minifyContent(content: string, extension: string): Promise<string> {
    if (extension === "js") {
      const result = await minifyJS(content);
      return result.code || content;
    }
    if (extension === "css") {
      const result = new CleanCSS().minify(content);
      return result.styles || content;
    }
    // fallback: simple whitespace minification
    return content.replace(/\s+/g, " ").trim();
  },
};
export default bundler;
