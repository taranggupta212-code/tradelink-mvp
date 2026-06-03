/**
 * TradeLink MVP - Sample Job Data
 * 
 * This file contains sample job postings for demonstration purposes.
 * In a real application, this data would come from an API.
 */

import type { Job } from '../types';

/**
 * Sample job postings for the TradeLink platform
 * Each job includes AI-generated scope estimates
 */
export const sampleJobs: Job[] = [
  {
    id: 'job-001',
    title: 'Kitchen Renovation',
    description: 'Complete kitchen renovation including cabinetry replacement, new benchtops, and splashback tiling. Looking for experienced carpenter to transform our dated kitchen into a modern space.',
    customer: {
      name: 'Sarah M.',
      location: 'Richmond VIC'
    },
    budget: {
      min: 4200,
      max: 5500
    },
    category: 'Carpentry',
    urgency: 'Urgent',
    aiScope: {
      description: 'Remove existing cabinetry and install new shaker style cabinets, install stone benchtops, retile splashback with subway tiles, and adjust plumbing connections for new sink location.',
      estimatedCost: {
        min: 4500,
        max: 5200
      },
      estimatedDuration: {
        min: 8,
        max: 10
      },
      confidence: 'High'
    },
    postedDate: new Date('2026-05-03'),
    hasAIEstimate: true
  },
  {
    id: 'job-002',
    title: 'Bathroom Waterproofing',
    description: 'Waterproofing required for main bathroom renovation. Need certified plumber to ensure compliance with Australian Standards before tiling begins.',
    customer: {
      name: 'Gupta T.',
      location: 'South Yarra VIC'
    },
    budget: {
      min: 1800,
      max: 2400
    },
    category: 'Plumbing',
    urgency: 'Normal',
    aiScope: {
      description: 'Apply waterproof membrane to bathroom floor and walls to AS 3740 standards, including shower recess, bath hob, and around all penetrations. Install puddle flange and bond breaker at junctions.',
      estimatedCost: {
        min: 1900,
        max: 2300
      },
      estimatedDuration: {
        min: 3,
        max: 4
      },
      confidence: 'High'
    },
    postedDate: new Date('2026-05-04'),
    hasAIEstimate: true
  },
  {
    id: 'job-003',
    title: 'Electrical Rewiring',
    description: 'Full electrical rewiring required for 3-bedroom heritage home. Switchboard needs upgrade to meet current safety standards. Property built in 1960s.',
    customer: {
      name: 'Priya K.',
      location: 'Carlton VIC'
    },
    budget: {
      min: 3000,
      max: 4000
    },
    category: 'Electrical',
    urgency: 'Urgent',
    aiScope: {
      description: 'Complete rewiring of 3-bedroom heritage home, replace all existing wiring with new TPS cable, upgrade switchboard to RCD protected board, install new power points and light switches throughout.',
      estimatedCost: {
        min: 3200,
        max: 3800
      },
      estimatedDuration: {
        min: 5,
        max: 7
      },
      confidence: 'Medium'
    },
    postedDate: new Date('2026-05-02'),
    hasAIEstimate: true
  },
  {
    id: 'job-004',
    title: 'Roof Leak Repair',
    description: 'Water leak detected above master bedroom during heavy rain. Terracotta tile roof needs inspection and repair. Urgent repair needed before next rainfall.',
    customer: {
      name: 'Ishita L.',
      location: 'Fitzroy VIC'
    },
    budget: {
      min: 800,
      max: 1200
    },
    category: 'Roofing',
    urgency: 'Urgent',
    aiScope: {
      description: 'Inspect roof above master bedroom, identify and repair leak source, replace cracked terracotta tiles, re-point ridge caps, and check flashing around penetrations.',
      estimatedCost: {
        min: 850,
        max: 1100
      },
      estimatedDuration: {
        min: 1,
        max: 2
      },
      confidence: 'Medium'
    },
    postedDate: new Date('2026-05-05'),
    hasAIEstimate: true
  },
  {
    id: 'job-005',
    title: 'Garden Landscaping',
    description: 'Complete backyard transformation including new lawn, garden beds, retaining wall, and irrigation system. Looking for experienced landscaper to create low-maintenance garden.',
    customer: {
      name: 'Rohan W.',
      location: 'Hawthorn VIC'
    },
    budget: {
      min: 2500,
      max: 3500
    },
    category: 'Landscaping',
    urgency: 'Normal',
    aiScope: {
      description: 'Install new Sir Walter buffalo lawn, create raised garden beds with sleepers, build 3m timber retaining wall, install drip irrigation system with timer, and plant low-maintenance shrubs.',
      estimatedCost: {
        min: 2700,
        max: 3200
      },
      estimatedDuration: {
        min: 4,
        max: 6
      },
      confidence: 'High'
    },
    postedDate: new Date('2026-05-01'),
    hasAIEstimate: true
  }
];

/**
 * Helper function to get a job by ID
 * @param jobId - The ID of the job to find
 * @returns The job object or undefined if not found
 */
export const getJobById = (jobId: string): Job | undefined => {
  return sampleJobs.find(job => job.id === jobId);
};

/**
 * Helper function to get jobs by category
 * @param category - The trade category to filter by
 * @returns Array of jobs matching the category
 */
export const getJobsByCategory = (category: string): Job[] => {
  return sampleJobs.filter(job => job.category === category);
};

/**
 * Helper function to get urgent jobs
 * @returns Array of jobs marked as urgent
 */
export const getUrgentJobs = (): Job[] => {
  return sampleJobs.filter(job => job.urgency === 'Urgent');
};

/**
 * Helper function to search jobs by title or description
 * @param query - Search query string
 * @returns Array of jobs matching the search query
 */
export const searchJobs = (query: string): Job[] => {
  const lowerQuery = query.toLowerCase();
  return sampleJobs.filter(job => 
    job.title.toLowerCase().includes(lowerQuery) ||
    job.description.toLowerCase().includes(lowerQuery) ||
    job.customer.location.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Format currency for display
 * @param amount - Amount in dollars
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format budget range for display
 * @param min - Minimum budget
 * @param max - Maximum budget
 * @returns Formatted budget range string
 */
export const formatBudgetRange = (min: number, max: number): string => {
  if (min >= 1000 && max >= 1000) {
    return `$${(min / 1000).toFixed(1)}k-$${(max / 1000).toFixed(1)}k`;
  }
  return `${formatCurrency(min)}-${formatCurrency(max)}`;
};

/**
 * Format duration range for display
 * @param min - Minimum days
 * @param max - Maximum days
 * @returns Formatted duration range string
 */
export const formatDurationRange = (min: number, max: number): string => {
  if (min === max) {
    return `${min} day${min > 1 ? 's' : ''}`;
  }
  return `${min}-${max} days`;
};

/**
 * Get trade-specific icon name for lucide-react
 * @param category - Trade category
 * @returns Icon name string
 */
export const getTradeIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Carpentry': 'Hammer',
    'Plumbing': 'Droplets',
    'Electrical': 'Zap',
    'Roofing': 'Home',
    'Landscaping': 'Trees',
    'Tiling': 'Grid3X3',
    'Painting': 'Paintbrush'
  };
  return icons[category] || 'Wrench';
};

/**
 * Get trade-specific gradient class
 * @param category - Trade category
 * @returns CSS class name for gradient
 */
export const getTradeGradientClass = (category: string): string => {
  const gradients: Record<string, string> = {
    'Carpentry': 'job-visual-carpentry',
    'Plumbing': 'job-visual-plumbing',
    'Electrical': 'job-visual-electrical',
    'Roofing': 'job-visual-roofing',
    'Landscaping': 'job-visual-landscaping',
    'Tiling': 'job-visual-tiling',
    'Painting': 'job-visual-painting'
  };
  return gradients[category] || 'job-visual-carpentry';
};

/**
 * Get trade-specific icon color class
 * @param category - Trade category
 * @returns CSS class name for icon color
 */
export const getTradeIconColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Carpentry': 'icon-navy',
    'Plumbing': 'icon-teal',
    'Electrical': 'icon-orange',
    'Roofing': 'icon-slate',
    'Landscaping': 'icon-forest',
    'Tiling': 'icon-orange',
    'Painting': 'icon-plum'
  };
  return colors[category] || 'icon-navy';
};