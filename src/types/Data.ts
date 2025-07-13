export interface Milestone {
  readonly name: string;
  readonly date: string;
  readonly description?: string;
}

export interface Period {
  readonly name: string;
  readonly milestones: Milestone[];
  readonly description?: string;
}

export interface Data {
  readonly periods: Period[];
  readonly isolatedMilestones: Milestone[];
}
