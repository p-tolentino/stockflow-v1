import useSWR from "swr";
import { getSuppliers } from "@/actions/suppliers";

// Fetcher function for SWR
const suppliersFetcher = async () => {
  const result = await getSuppliers();
  if (result.error) {
    throw new Error(result.error);
  }
  return result.data || [];
};

export function useSuppliers() {
  const { data, error, isLoading, mutate } = useSWR(
    "suppliers", // Unique key for this data
    suppliersFetcher,
    {
      revalidateOnFocus: false, // Optional: prevent re-fetch on window focus
      revalidateOnReconnect: false, // Optional: prevent re-fetch on reconnect
      refreshInterval: 0, // No automatic refresh
    },
  );

  return {
    suppliers: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}
