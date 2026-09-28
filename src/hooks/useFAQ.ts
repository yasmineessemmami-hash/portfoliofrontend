import { useEffect, useState } from "react";
import { faqService } from "@/services/faq.service";
import type { FAQResponse } from "@/types/faq.types";

interface UseFAQReturn {
  data: FAQResponse | null;
  loading: boolean;
  error: string | null;
}

export const useFAQ = (): UseFAQReturn => {
  const [data, setData] = useState<FAQResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await faqService.getFAQData();
        // Ensure backward compatibility with 'faqs' field
        const mappedResponse = {
          ...response,
          faqs: response.items || response.faqs || []
        };
        setData(mappedResponse);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch FAQ data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
