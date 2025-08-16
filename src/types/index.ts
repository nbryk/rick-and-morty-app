export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
  gender?: string;
}

export interface Info {
  next: string | null;
  prev: string | null;
  pages: number;
}

export interface HomeProps {
  characters: Character[];
  info: Info;
  hasError?: boolean;
  locations: string[];
}
