export type LocationType = 'Online' | 'In-Person' | 'Hybrid';

export type HackathonSource = 'Devpost' | 'MLH' | 'Unstop' | 'Devfolio' | 'Custom';

export interface Hackathon {
  id: string;
  slug: string;
  title: string;
  description: string;
  url: string;
  banner_url?: string;
  prize_pool: number;
  currency: string;
  location_type: LocationType;
  location?: string;
  location_name?: string;
  start_date: string;
  registration_end?: string;
  submission_deadline: string;
  tags: string[];
  source: HackathonSource;
  is_featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subscriber {
  id?: string;
  telegram_chat_id: string;
  telegram_username?: string;
  filter_tags: string[];
  min_prize_pool?: number;
  notify_days_before: number[]; // e.g. [7, 3, 1]
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_notified_at?: string;
}

export type NotificationType = '7_days' | '3_days' | '1_day' | 'new_hackathon';

export interface NotificationLog {
  id?: string;
  subscriber_id: string;
  hackathon_id: string;
  notification_type: NotificationType;
  status: 'sent' | 'failed';
  telegram_message_id?: string;
  sent_at?: string;
}

export interface HackathonFilterOptions {
  search?: string;
  tag?: string;
  location?: LocationType | 'All';
  sortBy?: 'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'newest';
}
