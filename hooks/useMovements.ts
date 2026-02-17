// app/hooks/useMovements.ts
import useSWR from "swr";
import { getMovements } from "@/actions/movements";

const fetcher = async (limit: number) => {
  const result = await getMovements(limit);
  if (result.error) throw new Error(result.error);
  return result.data || [];
};

export function useMovements(limit: number = 50) {
  const { data, error, isLoading, mutate } = useSWR(["movements", limit], () =>
    fetcher(limit),
  );

  return {
    movements: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}
