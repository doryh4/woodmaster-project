import { create } from 'zustand';

export interface Lead {
  _id?: string;
  customerName: string;
  phone: string;
  jobType: string;
  notes?: string;
  status?: string;
  createdAt?: string;
}

interface LeadStoreState {
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  addLead: (newLead: Lead) => void;
}

const useLeadStore = create<LeadStoreState>((set) => ({
  leads: [],
  setLeads: (leads) => set({ leads }),
  addLead: (newLead) => set((state) => ({
    leads: [newLead, ...state.leads]
  })),
}));

export default useLeadStore;
