const caching = {
  async cacheComponents(
    creativeID: string
  ): Promise<{ managementScript: string }> {
    return {
      managementScript:
        "console.log('managementScript for " + creativeID + "');",
    };
  },
};

export default caching;
