export interface Testimonial {
  name: string;
  location: string;
  quote: string;
}

export interface TestimonialData {
  tagline: string;
  items: Testimonial[];
}
