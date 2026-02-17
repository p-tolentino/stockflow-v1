import useSWR from "swr";
import { getInventoryItems } from "@/actions/inventory";

// Fetcher function for SWR
const inventoryItemsFetcher = async () => {
  const result = await getInventoryItems();
  if (result.error) {
    throw new Error(result.error);
  }
  return result.data || [];
};

export function useInventoryItems() {
  const { data, error, isLoading, mutate } = useSWR(
    "inventory-items",
    inventoryItemsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    },
  );

  return {
    items: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}
