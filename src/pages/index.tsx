import { Character, HomeProps, Info } from "@/types";
import Head from "next/head";
import CharacterCard from "@/components/CharacterCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SearchIcon from "@/components/SearchIcon";

import { GetServerSidePropsContext } from "next";
import { FormEvent } from "react";

import { useDebounce } from "use-debounce";

import styles from "@/styles/Home.module.css";
import {
  fetchCharactersByLocation,
  fetchCharactersByQuery,
} from "@/api/characters";
import { getPageNumbers } from "@/utils/pagination";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;

  const nameQuery = query.name || "";
  const pageQuery = query.page || "1";
  const statusQuery = query.status || "";
  const genderQuery = query.gender || "";
  const locationQuery = query.location || "";

  const params = {
    nameQuery,
    pageQuery,
    statusQuery,
    genderQuery,
  };

  try {
    const locationsPromise = fetch("https://rickandmortyapi.com/api/location");
    const charactersPromise = locationQuery
      ? fetchCharactersByLocation({ ...params, locationQuery })
      : fetchCharactersByQuery(params);

    const [locationsRes, charactersRes] = await Promise.all([
      locationsPromise,
      charactersPromise,
    ]);

    const locationsData = await locationsRes.json();
    const locations = locationsData.results.map(
      (loc: { name: string }) => loc.name
    );

    const { characters, info } = charactersRes;

    return {
      props: {
        characters,
        info,
        locations,
        hasError: false,
      },
    };
  } catch (error) {
    console.error("Error loading data:", error);
    return {
      props: {
        characters: [],
        info: { prev: null, next: null, pages: 1 },
        locations: [],
        hasError: true,
      },
    };
  }
}

function createSearchParams(
  name: string,
  status: string,
  gender: string,
  location: string,
  page?: number
) {
  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (status) params.set("status", status);
  if (gender) params.set("gender", gender);
  if (location) params.set("location", location);
  if (page) params.set("page", page.toString());
  return params.toString();
}

export default function Home({
  characters,
  hasError,
  info = { prev: null, next: null, pages: 1 },
  locations = [],
}: HomeProps) {
  const router = useRouter();
  const [name, setName] = useState((router.query.name as string) || "");

  const [status, setStatus] = useState((router.query.status as string) || "");

  const [gender, setGender] = useState((router.query.gender as string) || "");

  const [location, setLocation] = useState(
    (router.query.location as string) || ""
  );

  const [debouncedName] = useDebounce(name, 500);

  useEffect(() => {
    if (!router.isReady) return;

    if (debouncedName !== (router.query.name || "")) {
      const params = new URLSearchParams();
      if (debouncedName) params.set("name", debouncedName);
      if (status) params.set("status", status);
      if (gender) params.set("gender", gender);
      if (location) params.set("location", location);

      router.push(`/?${params.toString()}`);
    }
  }, [
    debouncedName,
    status,
    gender,
    location,
    router.isReady,
    router.query.name,
    router,
  ]);

  useEffect(() => {
    if (!router.isReady) return;

    if (
      status !== (router.query.status || "") ||
      gender !== (router.query.gender || "") ||
      location !== (router.query.location || "")
    ) {
      const newQuery = createSearchParams(name, status, gender, location);
      router.push(`/?${newQuery}`);
    }
  }, [
    status,
    name,
    gender,
    location,
    router.isReady,
    router.query.status,
    router.query.gender,
    router.query.location,
    router,
  ]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const newQuery = createSearchParams(name, status, gender, location);
    router.push(`/?${newQuery}`);
  };

  const handlePageChange = (pageNumber: number) => {
    const newQuery = createSearchParams(
      name,
      status,
      gender,
      location,
      pageNumber
    );
    router.push(`/?${newQuery}`);
  };

  const currentPage = Number(router.query.page) || 1;
  const totalPages = info.pages;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <>
      <Head>
        <title>Rick & Morty Character Viewer</title>
        <meta
          name="description"
          content="A simple Rick & Morty character viewer built with Next.js"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {" "}
        <h1 className={styles.title}>
          Welcome to the Rick & Morty Character Viewer!
        </h1>
        <form className={styles.form} onSubmit={handleSearch}>
          <div className={styles.inputContainer}>
            <input
              className={styles.searchField}
              type="text"
              placeholder="Enter the name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button className={styles.searchButton} type="submit">
              <SearchIcon style={{ width: "20px", height: "20px" }} />
            </button>
          </div>

          <select
            className={styles.select}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            className={styles.select}
            value={gender}
            onChange={(event) => setGender(event.target.value)}
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="genderless">Genderless</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            className={styles.select}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((loc: string, index: number) => (
              <option key={index} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </form>
        <div className={styles.grid}>
          {hasError ? (
            <p className={styles.error}>Failed to load characters.</p>
          ) : characters.length > 0 ? (
            characters.map((character) => (
              <CharacterCard
                key={character.id}
                id={character.id}
                name={character.name || "Unknown"}
                image={character.image || "/placeholder.png"}
                species={character.species}
                status={character.status}
              />
            ))
          ) : (
            <p className={styles.noResults}>No characters found.</p>
          )}
        </div>
        <div className={styles.pagination}>
          {info.prev && (
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              &lt;
            </button>
          )}

          {pageNumbers.map((page, index) => (
            <button
              key={index}
              className={`${styles.paginationButton} ${
                page === currentPage ? styles.paginationButtonActive : ""
              }`}
              disabled={page === "..."}
              onClick={() => handlePageChange(Number(page))}
            >
              {page}
            </button>
          ))}

          {info.next && (
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              &gt;
            </button>
          )}
        </div>
      </main>
    </>
  );
}
