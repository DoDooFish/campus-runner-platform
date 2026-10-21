export type Category='快递'|'代买'|'占座'|'资料'|'其他';
export type Status='open'|'accepted'|'completed'|'cancelled';
export interface Profile{id:string;display_name:string;campus:string|null;credit_score:number;mutual_points:number;completed_count:number;role:'user'|'admin'}
export interface Task{id:string;publisher_id:string;accepted_by:string|null;title:string;description:string;category:Category;pickup_location:string;destination:string;reward:number;deadline:string|null;distance_m:number|null;status:Status;created_at:string;publisher?:{display_name:string;credit_score:number}}
