import { toast } from 'sonner';
import supabaseBackend from '../services/supabase-backend';

export const showSuccessToast = (message: string, description: string, offlineDescription?: string) => {
  if (supabaseBackend.isOfflineMode()) {
    toast.success('Demo Mode - ' + message, {
      description: offlineDescription || 'Data simulated locally in demo mode'
    });
  } else {
    toast.success('Saved to Supabase - ' + message, {
      description: description.replace('PostgreSQL', 'Supabase').replace('POST /api/', 'Supabase API ')
    });
  }
};

export const showErrorToast = (message: string, description: string) => {
  if (supabaseBackend.isOfflineMode()) {
    toast.error('Demo Mode - ' + message, {
      description: 'Error simulated in demo mode'
    });
  } else {
    toast.error('Supabase Error - ' + message, {
      description: description.replace('PostgreSQL', 'Supabase').replace('POST /api/', 'Supabase API ')
    });
  }
};

export const showInfoToast = (message: string, description: string) => {
  toast.info(supabaseBackend.isOfflineMode() ? 'Demo Mode - ' + message : message, {
    description: description
  });
};