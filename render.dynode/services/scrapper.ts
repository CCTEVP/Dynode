const scrapper = {
    /**
     * Retrieves component names, animation names, and asset sources from the JSON content.
     * @param content JSON string or object
     * @returns Promise<{ components: string[], animations: string[], assets: string[] }>
     */
    async getComponents(
        content: string
    ): Promise<{ components: string[]; animations: string[]; assets: string[] }> {
        const components = new Set<string>();
        const animations = new Set<string>();
        const assets = new Set<string>();
        const assetExtensions =
            /\.(ttf|woff2?|jpe?g|png|gif|svg|mp4|webm|ogg|mp3|wav)$/i;

        function recurse(obj: any) {
            if (obj && typeof obj === "object") {
                // Animation detection
                if (
                    typeof obj.type === "string" &&
                    (obj.type.endsWith("Layout") || obj.type.endsWith("Widget")) &&
                    typeof obj.animation === "string"
                ) {
                    animations.add(obj.type + obj.animation);
                }
                // Asset detection for both 'source' and 'font'
                ["source", "font"].forEach((field) => {
                    if (obj[field]) {
                        // If field is a string (legacy support)
                        if (
                            typeof obj[field] === "string" &&
                            assetExtensions.test(obj[field])
                        ) {
                            assets.add(obj[field]);
                        }
                        // If field is an object with paths array (current structure)
                        if (
                            typeof obj[field] === "object" &&
                            Array.isArray(obj[field].paths)
                        ) {
                            obj[field].paths.forEach((pathObj: any) => {
                                if (
                                    pathObj &&
                                    typeof pathObj.url === "string" &&
                                    assetExtensions.test(pathObj.url)
                                ) {
                                    assets.add(pathObj.url);
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
            json = typeof content === "string" ? JSON.parse(content) : content;
        } catch {
            return { components: [], animations: [], assets: [] };
        }

        recurse(json);
        return {
            components: Array.from(components),
            animations: Array.from(animations),
            assets: Array.from(assets),
        };
    },
};

export default scrapper;
