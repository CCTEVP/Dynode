import { useCallback, useState } from "react";
import env from "../../config/env"; // static config

export default function useToolComponents() {
  const [components, setComponents] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setComponents(null);
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      let res: Response | null = null;
      const internalBase =
        env.env === "docker" ? "/api" : env.externalOrigins.source;
      const primaryUrl = internalBase + "/data/components";
      // Attempt direct internal (docker) or explicit dev host first
      try {
        res = await fetch(primaryUrl, { signal: controller.signal });
      } catch {}
      // Fallback to relative (might be proxied via nginx/frontend dev server)
      if (!res || !res.ok) {
        try {
          res = await fetch("/data/components", { signal: controller.signal });
        } catch {}
      }
      if (!res || !res.ok) throw new Error("fetch failed");
      const json = await res.json();
      setComponents(Array.isArray(json) ? json : []);
    } catch (err) {
      setComponents([]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  return { components, loading, reload };
}
