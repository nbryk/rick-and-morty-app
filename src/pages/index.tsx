import Head from "next/head";
import CharacterCard from "@/components/CharacterCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SearchIcon from "@/components/SearchIcon";

import { GetServerSidePropsContext } from "next";
import { FormEvent } from "react";

import { useDebounce } from "use-debounce";

import styles from "@/styles/Home.module.css";

// Типизація персонажа залишається такою ж
interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
}

interface Info {
  next: string | null;
  prev: string | null;
  pages: number; // Додаємо загальну кількість сторінок
}

interface HomeProps {
  characters: Character[];
  info: Info; // Додаємо інформацію про пагінацію
  hasError?: boolean;
  locations: string[];
}

// export async function getServerSideProps(context: GetServerSidePropsContext) {
//   const { query } = context;

//   const nameQuery = query.name || "";
//   const pageQuery = query.page || "1";
//   const statusQuery = query.status || "";
//   const genderQuery = query.gender || "";
//   const locationQuery = query.location || "";

//   const locationsRes = await fetch("https://rickandmortyapi.com/api/location");
//   const locationsData = await locationsRes.json();
//   const locations = locationsData.results.map(
//     (loc: { name: string }) => loc.name
//   );

//   if (locationQuery) {
//     const locationRes = await fetch(
//       `https://rickandmortyapi.com/api/location/?name=${locationQuery}`
//     );

//     const locationData = await locationRes.json();

//     if (locationData.results && locationData.results.length > 0) {
//       const residentsUrls = locationData.results[0].residents;
//       // const ids = residentsUrls
//       //   .map((url: string) => url.split("/").pop())
//       //   .slice(0, 20); // перші 20 персонажів

//       const ids = residentsUrls
//         .map((url: string) => url.split("/").pop())
//         .slice(0);

//       const charactersRes = await fetch(
//         `https://rickandmortyapi.com/api/character/${ids.join(",")}`
//       );

//       const charactersData = await charactersRes.json();

//       let filteredCharacters = Array.isArray(charactersData)
//         ? charactersData
//         : [charactersData];

//       // 🔍 Фільтрація за ім'ям
//       if (nameQuery) {
//         filteredCharacters = filteredCharacters.filter((char) =>
//           char.name.toLowerCase().includes((nameQuery as string).toLowerCase())
//         );
//       }

//       // 🔍 Фільтрація за статусом
//       if (statusQuery) {
//         filteredCharacters = filteredCharacters.filter(
//           (char) =>
//             char.status.toLowerCase() === (statusQuery as string).toLowerCase()
//         );
//       }

//       // 🔍 Фільтрація за гендером
//       if (genderQuery) {
//         filteredCharacters = filteredCharacters.filter(
//           (char) =>
//             char.gender.toLowerCase() === (genderQuery as string).toLowerCase()
//         );
//       }

//       return {
//         props: {
//           characters: filteredCharacters,
//           info: { prev: null, next: null, pages: 1 },
//           locations,
//         },
//       };
//     } else {
//       return {
//         props: {
//           characters: [],
//           info: { prev: null, next: null, pages: 1 },
//           locations,
//           hasError: false,
//         },
//       };
//     }
//   }

//   try {
//     const res = await fetch(
//       `https://rickandmortyapi.com/api/character?name=${nameQuery}&page=${pageQuery}&status=${statusQuery}&gender=${genderQuery}`
//     );

//     // Запит для локацій
//     // const locationsRes = await fetch(
//     //   "https://rickandmortyapi.com/api/location"
//     // );

//     if (!res.ok) {
//       if (res.status === 404) {
//         return {
//           props: {
//             characters: [],
//             hasError: false,
//             info: { prev: null, next: null, pages: 1 },
//             locations: [],
//           },
//         };
//       }
//       throw new Error(`HTTP error! status: ${res.status}`);
//     }

//     const data = await res.json();
//     //const locationsData = await locationsRes.json();

//     // Витягуємо назви локацій та перетворюємо в масив рядків
//     // const locations = locationsData.results.map(
//     //   (loc: { name: string }) => loc.name
//     // );

//     return {
//       props: {
//         characters: data.results || [],
//         info: data.info || { prev: null, next: null, pages: 1 },
//         locations: locations,
//       },
//     };
//   } catch (error) {
//     console.error("Error loading characters:", error);

//     return {
//       props: {
//         characters: [],
//         hasError: true,
//         info: { prev: null, next: null, pages: 1 },
//         locations: [],
//       },
//     };
//   }
// }
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;

  const nameQuery = query.name || "";
  const pageQuery = query.page || "1";
  const statusQuery = query.status || "";
  const genderQuery = query.gender || "";
  const locationQuery = query.location || "";

  // ... (запит на локації без змін) ...
  const locationsRes = await fetch("https://rickandmortyapi.com/api/location");
  const locationsData = await locationsRes.json();
  const locations = locationsData.results.map(
    (loc: { name: string }) => loc.name
  );

  let characters: Character[] = [];
  let info: Info = { prev: null, next: null, pages: 1 };
  let hasError = false;

  try {
    if (locationQuery) {
      const locationRes = await fetch(
        `https://rickandmortyapi.com/api/location/?name=${locationQuery}`
      );
      const locationData = await locationRes.json();

      if (locationData.results && locationData.results.length > 0) {
        const residentsUrls = locationData.results[0].residents;
        const ids = residentsUrls.map((url: string) => url.split("/").pop());

        if (ids.length > 0) {
          const charactersRes = await fetch(
            `https://rickandmortyapi.com/api/character/${ids.join(",")}`
          );
          const charactersData = await charactersRes.json();

          let filteredCharacters = Array.isArray(charactersData)
            ? charactersData
            : [charactersData];

          // 🔍 Фільтрація за ім'ям, статусом, гендером
          if (nameQuery) {
            const name = Array.isArray(nameQuery) ? nameQuery[0] : nameQuery;
            filteredCharacters = filteredCharacters.filter((char) =>
              char.name.toLowerCase().includes(name.toLowerCase())
            );
          }
          if (statusQuery) {
            const status = Array.isArray(statusQuery)
              ? statusQuery[0]
              : statusQuery;
            filteredCharacters = filteredCharacters.filter(
              (char) => char.status.toLowerCase() === status.toLowerCase()
            );
          }
          if (genderQuery) {
            const gender = Array.isArray(genderQuery)
              ? genderQuery[0]
              : genderQuery;
            filteredCharacters = filteredCharacters.filter(
              (char) => char.gender.toLowerCase() === gender.toLowerCase()
            );
          }

          // 🚨 Ось тут ми додаємо власну логіку пагінації!
          const charactersPerPage = 20; // Кількість персонажів на сторінці
          const totalCharacters = filteredCharacters.length;
          const totalPages = Math.ceil(totalCharacters / charactersPerPage);
          const currentPage = Number(pageQuery);

          // Обрізаємо масив, щоб показати тільки персонажів поточної сторінки
          const startIndex = (currentPage - 1) * charactersPerPage;
          const endIndex = startIndex + charactersPerPage;
          characters = filteredCharacters.slice(startIndex, endIndex);

          // Оновлюємо об'єкт info для пагінації
          info = {
            pages: totalPages,
            prev: currentPage > 1 ? "..." : null, // Використовуємо ... для відображення
            next: currentPage < totalPages ? "..." : null,
          };
        }
      } else {
        characters = [];
      }
    } else {
      // Логіка, якщо локація не обрана (залишаємо без змін)
      const res = await fetch(
        `https://rickandmortyapi.com/api/character?name=${nameQuery}&page=${pageQuery}&status=${statusQuery}&gender=${genderQuery}`
      );

      if (!res.ok) {
        if (res.status === 404) {
          return {
            props: {
              characters: [],
              hasError: false,
              info: { prev: null, next: null, pages: 1 },
              locations,
            },
          };
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      characters = data.results || [];
      info = data.info || { prev: null, next: null, pages: 1 };
    }
  } catch (error) {
    console.error("Error loading data:", error);
    hasError = true;
  }

  return {
    props: {
      characters,
      info,
      locations,
      hasError,
    },
  };
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

  // useEffect для debounce-пошуку
  useEffect(() => {
    // Не робимо нічого при першому завантаженні
    if (!router.isReady) return;

    // Перевіряємо, чи змінилось ім'я, щоб уникнути циклу
    if (debouncedName !== (router.query.name || "")) {
      const params = new URLSearchParams();
      if (debouncedName) params.set("name", debouncedName);
      if (status) params.set("status", status);
      if (gender) params.set("gender", gender);
      if (location) params.set("location", location);

      // Завжди повертаємо на першу сторінку при зміні імені
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

  // useEffect для зміни статусу
  useEffect(() => {
    if (!router.isReady) return;

    // Перевіряємо, чи змінився статус
    if (
      status !== (router.query.status || "") ||
      gender !== (router.query.gender || "") ||
      location !== (router.query.location || "")
    ) {
      const params = new URLSearchParams();
      if (name) params.set("name", name);
      if (status) params.set("status", status);
      if (gender) params.set("gender", gender);
      if (location) params.set("location", location);
      router.push(`/?${params.toString()}`);
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
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (status) params.set("status", status);
    if (gender) params.set("gender", gender);
    if (location) params.set("location", location);
    // При сабміті завжди повертаємо на першу сторінку
    router.push(`/?${params.toString()}`);
  };

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (status) params.set("status", status);
    if (gender) params.set("gender", gender);
    if (location) params.set("location", location);
    params.set("page", pageNumber.toString());
    router.push(`/?${params.toString()}`);
  };

  const currentPage = Number(router.query.page) || 1;
  const totalPages = info.pages;

  const pageNumbers = [];
  const maxPagesToShow = 5;
  const half = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, currentPage + half);

  if (endPage - startPage + 1 < maxPagesToShow) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, maxPagesToShow);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
  }

  // Додаємо багатокрапки, якщо потрібно
  if (startPage > 1) {
    pageNumbers.push("...");
  }

  // Додаємо сторінки з діапазону
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Додаємо багатокрапки, якщо потрібно
  if (endPage < totalPages) {
    pageNumbers.push("...");
  }

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
