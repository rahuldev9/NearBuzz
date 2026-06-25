import { useCallback, useState } from "react";

export function usePullToRefresh(
  refreshFn: () => Promise<void> = async () => {},
) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await refreshFn();
    } catch (err) {
      console.log(err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshFn, refreshing]);

  return {
    refreshing,
    onRefresh,
  };
}
