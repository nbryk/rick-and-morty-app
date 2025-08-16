//import { Character, Info } from "@/types";
import { filterCharacters } from "@/utils/filterCharacters";

interface QueryParams {
  nameQuery?: string | string[];
  pageQuery?: string | string[];
  statusQuery?: string | string[];
  genderQuery?: string | string[];
  locationQuery?: string | string[];
}

export async function fetchCharactersByLocation({
  locationQuery,
  nameQuery,
  statusQuery,
  genderQuery,
  pageQuery,
}: QueryParams) {
  const locationRes = await fetch(
    `https://rickandmortyapi.com/api/location/?name=${locationQuery}`
  );
  const locationData = await locationRes.json();

  if (!locationData.results || locationData.results.length === 0) {
    return { characters: [], info: { prev: null, next: null, pages: 1 } };
  }

  const residentsUrls = locationData.results[0].residents;
  const ids = residentsUrls.map((url: string) => url.split("/").pop());

  if (ids.length === 0) {
    return { characters: [], info: { prev: null, next: null, pages: 1 } };
  }

  const charactersRes = await fetch(
    `https://rickandmortyapi.com/api/character/${ids.join(",")}`
  );
  const charactersData = await charactersRes.json();

  let filteredCharacters = Array.isArray(charactersData)
    ? charactersData
    : [charactersData];

  filteredCharacters = filterCharacters(filteredCharacters, {
    nameQuery,
    statusQuery,
    genderQuery,
  });

  const charactersPerPage = 20;
  const totalCharacters = filteredCharacters.length;
  const totalPages = Math.ceil(totalCharacters / charactersPerPage);
  const currentPage = Number(pageQuery);

  const startIndex = (currentPage - 1) * charactersPerPage;
  const endIndex = startIndex + charactersPerPage;
  const characters = filteredCharacters.slice(startIndex, endIndex);

  const info = {
    pages: totalPages,
    prev: currentPage > 1 ? "..." : null,
    next: currentPage < totalPages ? "..." : null,
  };

  return { characters, info };
}

export async function fetchCharactersByQuery({
  nameQuery,
  pageQuery,
  statusQuery,
  genderQuery,
}: QueryParams) {
  const res = await fetch(
    `https://rickandmortyapi.com/api/character?name=${nameQuery}&page=${pageQuery}&status=${statusQuery}&gender=${genderQuery}`
  );

  if (!res.ok) {
    if (res.status === 404) {
      return { characters: [], info: { prev: null, next: null, pages: 1 } };
    }
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  const characters = data.results || [];
  const info = data.info || { prev: null, next: null, pages: 1 };

  return { characters, info };
}
