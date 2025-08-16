import { Character } from "@/types";

interface FilterParams {
  nameQuery?: string | string[];
  statusQuery?: string | string[];
  genderQuery?: string | string[];
}

const getSingleQueryParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) {
    return param[0] || "";
  }
  return param || "";
};

export const filterCharacters = (
  characters: Character[],
  query: FilterParams
): Character[] => {
  let filteredCharacters = characters;

  const name = getSingleQueryParam(query.nameQuery);
  const status = getSingleQueryParam(query.statusQuery);
  const gender = getSingleQueryParam(query.genderQuery);

  if (name) {
    filteredCharacters = filteredCharacters.filter((char) =>
      char.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  if (status) {
    filteredCharacters = filteredCharacters.filter(
      (char) => char.status.toLowerCase() === status.toLowerCase()
    );
  }
  if (gender) {
    filteredCharacters = filteredCharacters.filter(
      (char) => char.gender?.toLowerCase() === gender.toLowerCase()
    );
  }

  return filteredCharacters;
};
