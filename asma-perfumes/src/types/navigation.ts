export interface NavLink {
  to: string;
  label: string;
}

export interface NavigationData {
  navLinks: NavLink[];
  footerCollections: string[];
  footerSupport: string[];
  brandTagline: string;
  newsletterText: string;
  copyright: string;
}
