import apiClient from "@/services/api";

export interface Icon {
  key: string;
  icon: string; // Icon name from backend (e.g., "ShoppingCart")
  name: string; // Display name (e.g., "Shopping Cart")
  library: string; // Library name (e.g., "lucide-react")
}

interface IconsApiResponse {
  success: boolean;
  message: string;
  data: Icon[];
}

export const iconService = {
  /**
   * Fetch available icons
   * POST /api/v1/ui/icons
   */
  getIcons: async (): Promise<Icon[]> => {
    const response = await apiClient.post<IconsApiResponse>("/ui/icons");
    return response.data.data;
  },
};

