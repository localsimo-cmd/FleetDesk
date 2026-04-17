export type Role = 'mechanic' | 'manager' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  role: Role;
  active: boolean;
}

export interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  engine_no?: string;
  tax_expiry?: string;
  current_odometer: number;
  active: boolean;
  created_at: string;
}

export interface PartCatalogueItem {
  id: string;
  name: string;
  category: string;
  sku?: string;
  is_service_item: boolean;
  service_interval_km?: number;
  active: boolean;
}

export interface JobCard {
  id: string;
  job_number: string;
  vehicle_id: string;
  mechanic_id: string;
  odometer_at_job: number;
  odometer_out?: number;
  job_type: string;
  complaint_details?: string;
  notes?: string;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
  // Joined fields
  vehicle?: Vehicle;
  mechanic?: UserProfile;
}

export interface JobPart {
  id: string;
  job_id: string;
  part_id: string;
  qty_ordered: number;
  qty_fitted: number;
  fitted: boolean;
  fit_odometer?: number;
  notes?: string;
  // Joined fields
  part?: PartCatalogueItem;
}

export interface ServiceAlert {
  id: string;
  vehicle_id: string;
  part_id: string;
  km_since_fit: number;
  threshold_km: number;
  status: 'due_soon' | 'overdue' | 'resolved';
  created_at: string;
  resolved_at?: string;
  // Joined fields
  vehicle?: Vehicle;
  part?: PartCatalogueItem;
}
