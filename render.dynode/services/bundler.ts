// Should receive type of resource, a list of items, mode and extension

const bundler = {
  async bundleComponents(resources: {
    name: string;
    items: string[];
    mode: boolean;
    extension: string;
  }): Promise<{
    payload: string;
  }> {
    const resourceName = resources.name;
    const items = resources.items;
    // join the items with a comma
    const itemsJoined = items.join(", ");

    const mode = resources.mode; // boolean
    const extension = resources.extension; // string

    // Retrieve files from the components, libraries, and assets arrays.
    // if debug is false, minify the contents of the files.

    // Return
    // Retrieve the contents of the components corresponding files, then the contents of the libraries, caching, and management scripts.
    return {
      payload:
        "console.log('Name: " +
        resourceName +
        "'); \nconsole.log('Items: " +
        itemsJoined +
        "'); \nconsole.log('Mode: " +
        mode +
        "'); \nconsole.log('Extension: " +
        extension +
        "');",
    };
  },
};
export default bundler;
