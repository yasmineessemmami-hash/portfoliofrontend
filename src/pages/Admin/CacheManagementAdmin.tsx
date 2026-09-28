import { useState } from "react";
import { Database, RefreshCw, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cacheService } from "@/services/cache.service";
import { AdminCard, AdminButton } from "@/components/Admin";

const CacheManagementAdmin = () => {
  const [clearing, setClearing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all caches? This will remove all cached data.')) {
      return;
    }

    setClearing(true);
    setMessage(null);

    try {
      const response = await cacheService.clearCache();
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'All caches cleared successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to clear caches' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error?.response?.data?.message || error?.message || 'Failed to clear caches' 
      });
    } finally {
      setClearing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleRefreshCache = async () => {
    if (!confirm('Are you sure you want to refresh all caches? This will queue a job to refresh all cached data from the database.')) {
      return;
    }

    setRefreshing(true);
    setMessage(null);

    try {
      const response = await cacheService.refreshCache();
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: response.message || 'Cache refresh job has been queued successfully!' 
        });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to queue cache refresh' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error?.response?.data?.message || error?.message || 'Failed to queue cache refresh' 
      });
    } finally {
      setRefreshing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Cache Management</h1>
        <p className="text-muted-foreground">
          Manage application cache. Clear caches to remove all cached data, or refresh to rebuild caches from the database.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Cache Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Clear Cache Card */}
        <AdminCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Clear Cache</h2>
                <p className="text-sm text-muted-foreground">Remove all cached data</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>This will immediately clear all cached data including:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Page data caches (Home, About, Services, etc.)</li>
                <li>Site configuration cache</li>
                <li>Theme and icon caches</li>
                <li>Meta page caches</li>
              </ul>
              <p className="pt-2 font-medium text-foreground">
                Note: Data will be fetched from the database on next request.
              </p>
            </div>

            <AdminButton
              onClick={handleClearCache}
              disabled={clearing || refreshing}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              {clearing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clearing Cache...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Caches
                </>
              )}
            </AdminButton>
          </div>
        </AdminCard>

        {/* Refresh Cache Card */}
        <AdminCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <RefreshCw className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Refresh Cache</h2>
                <p className="text-sm text-muted-foreground">Rebuild all caches from database</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>This will queue a background job to refresh all cached data:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Fetches fresh data from the database</li>
                <li>Stores data in cache (1 year expiration)</li>
                <li>Processes asynchronously via queue</li>
                <li>Does not block the request</li>
              </ul>
              <p className="pt-2 font-medium text-foreground">
                Note: Ensure your queue worker is running for the job to process.
              </p>
            </div>

            <AdminButton
              onClick={handleRefreshCache}
              disabled={clearing || refreshing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {refreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Queueing Refresh Job...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh All Caches
                </>
              )}
            </AdminButton>
          </div>
        </AdminCard>
      </div>

      {/* Information Card */}
      <AdminCard>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Cache Information</h3>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Cache Expiration:</strong> All caches expire after 1 year
            </p>
            <p>
              <strong className="text-foreground">Public Endpoints:</strong> Check cache first, fetch from database if cache is empty
            </p>
            <p>
              <strong className="text-foreground">Admin Endpoints:</strong> Automatically clear/refresh cache when data is updated
            </p>
            <p>
              <strong className="text-foreground">Queue Worker:</strong> Make sure to run <code className="px-2 py-1 bg-secondary rounded text-xs">php artisan queue:work</code> for refresh cache to process
            </p>
          </div>
        </div>
      </AdminCard>
    </div>
  );
};

export default CacheManagementAdmin;

