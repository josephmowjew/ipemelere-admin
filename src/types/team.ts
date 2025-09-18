export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
    phone?: string;
  };
  isActive?: boolean;
  joinDate?: string;
}

export interface TeamSection {
  title: string;
  description: string;
  members: TeamMember[];
}