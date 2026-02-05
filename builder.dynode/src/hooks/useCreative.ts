import { useCallback, useEffect, useRef, useState } from "react";
import type { Creative } from "../types/creative";
import creativeService from "../services/creative";

type UseCreativeResult = {
  creative: Creative | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};

export default function useCreative(creativeId?: string): UseCreativeResult {
  const [creative, setCreative] = useState<Creative | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!creativeId) return;
    setLoading(true);
    setError(null);
    try {
      const c = await creativeService.getCreative(creativeId);
      if (!mounted.current) return;
      setCreative(c as Creative | null);
    } catch (err: any) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
      setCreative(null);
    } finally {
      if (!mounted.current) return;
      setLoading(false);
    }
  }, [creativeId]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return {
    creative,
    loading,
    error,
    reload: load,
  };
}
