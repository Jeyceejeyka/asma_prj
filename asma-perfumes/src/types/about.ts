export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutValue {
  iconName: string;
  title: string;
  desc: string;
}

export interface AboutMilestone {
  year: string;
  title: string;
  desc: string;
}

export interface AboutProcess {
  step: string;
  title: string;
  iconName: string;
  desc: string;
}

export interface AboutFounderQuote {
  quote: string;
  name: string;
  title: string;
}

export interface AboutHero {
  subtitle: string;
  titleLine1: string;
  titleHighlight: string;
  titleLine2: string;
  description: string;
}

export interface AboutCta {
  title: string;
  highlight: string;
  description: string;
}

export interface AboutData {
  hero: AboutHero;
  stats: AboutStat[];
  values: AboutValue[];
  founderQuote: AboutFounderQuote;
  milestones: AboutMilestone[];
  process: AboutProcess[];
  cta: AboutCta;
}
