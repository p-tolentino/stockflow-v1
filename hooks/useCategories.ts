import useSWR from "swr";
import { getCategories } from "@/actions/categories";

// Fetcher function for SWR
const categoriesFetcher = async () => {
  const result = await getCategories();
  if (result.error) {
    throw new Error(result.error);
  }
  return result.data || [];
};

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(
    "categories", // Unique key for this data
    categoriesFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    },
  );

  return {
    categories: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}
