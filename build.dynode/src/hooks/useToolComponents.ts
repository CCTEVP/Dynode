import { useCallback, useState } from "react";

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
      try {
        res = await fetch("http://localhost:3000/data/components", {
          signal: controller.signal,
        });
      } catch {}
      if (!res || !res.ok)
        res = await fetch("/data/components", { signal: controller.signal });
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
