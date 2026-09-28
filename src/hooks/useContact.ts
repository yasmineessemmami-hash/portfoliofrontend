import { useEffect, useState } from "react";
import { contactService } from "@/services/contact.service";
import type { ContactResponse } from "@/types/contact.types";

interface UseContactReturn {
  data: ContactResponse | null;
  loading: boolean;
  error: string | null;
}

export const useContact = (): UseContactReturn => {
  const [data, setData] = useState<ContactResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await contactService.getContactData();
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch contact data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
