import Head from "next/head";
import CharacterCard from "@/components/CharacterCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SearchIcon from "@/components/SearchIcon";

import { GetServerSidePropsContext } from "next";
import { FormEvent } from "react";

import { useDebounce } from "use-debounce";

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
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const nameQuery = query.name || "";

  const pageQuery = query.page || "1";

  const statusQuery = query.status || "";

  try {
    const res = await fetch(
      `https://rickandmortyapi.com/api/character?name=${nameQuery}&page=${pageQuery}&status=${statusQuery}`
    );

    if (!res.ok) {
      // Якщо запит завершився з помилкою (наприклад, сторінки не існує),
      // ми можемо відловити це тут
      if (res.status === 404) {
        return {
          props: {
            characters: [],
            hasError: false,
            // Додатково передамо інформацію про пагінацію
            info: { prev: null, next: null, pages: 1 },
          },
        };
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return {
      props: {
        characters: data.results || [],
        // Додатково передаємо об'єкт info з API, який містить посилання на наступну/попередню сторінки
        info: data.info || { prev: null, next: null, pages: 1 },
      },
    };
  } catch (error) {
    console.error("Error loading characters:", error);

    return {
      props: {
        characters: [],
        hasError: true,
        info: { prev: null, next: null, pages: 1 },
      },
    };
  }
}

export default function Home({
  characters,
  hasError,
  info = { prev: null, next: null, pages: 1 },
}: HomeProps) {
  const router = useRouter();
  const [name, setName] = useState((router.query.name as string) || "");

  const [status, setStatus] = useState((router.query.status as string) || ""); // Новий стан для статусу

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

      // Завжди повертаємо на першу сторінку при зміні імені
      router.push(`/?${params.toString()}`);
    }
  }, [debouncedName, status, router.isReady, router.query.name, router]);

  // useEffect для зміни статусу
  useEffect(() => {
    if (!router.isReady) return;

    // Перевіряємо, чи змінився статус
    if (status !== (router.query.status || "")) {
      const params = new URLSearchParams();
      if (name) params.set("name", name);
      if (status) params.set("status", status);
      router.push(`/?${params.toString()}`);
    }
  }, [status, name, router.isReady, router.query.status, router]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (status) params.set("status", status);
    // При сабміті завжди повертаємо на першу сторінку
    router.push(`/?${params.toString()}`);
  };

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (status) params.set("status", status);
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

      <main style={{ padding: "20px" }}>
        {" "}
        {/* Можете додати inline стилі для початку */}
        <h1>Welcome to the Rick & Morty Character Viewer!</h1>
        <form
          className="search-form"
          onSubmit={handleSearch}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {/* Контейнер для поля вводу та кнопки пошуку */}
          <div style={{ position: "relative" }}>
            <input
              className="search-field"
              type="text"
              placeholder="Enter the name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{
                padding: "10px 40px 10px 10px", // Додаємо відступ справа для кнопки
                fontSize: "16px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              type="submit"
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                height: "100%", // Робимо кнопку висотою з інпут
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <SearchIcon style={{ width: "20px", height: "20px" }} />
            </button>
          </div>

          {/* Випадаючий список для фільтрації за статусом */}
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="">All Statuses</option>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="unknown">Unknown</option>
          </select>
        </form>
        {/* Тут код для відображення персонажів */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
            justifyItems: "center",
          }}
        >
          {hasError ? (
            <p style={{ color: "red" }}>Failed to load characters.</p>
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
            <p>No characters found.</p>
          )}
        </div>
        {/* Додаємо кнопки пагінації */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
            padding: "0 20px",
          }}
        >
          {/* Кнопка "Previous" */}
          {info.prev && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                padding: "8px 16px", // Додаємо відступи
                fontSize: "16px", // Збільшуємо розмір шрифту
                cursor: "pointer", // Змінюємо курсор, щоб показати, що кнопка клікабельна
                border: "1px solid #ccc",
                borderRadius: "4px",
                color: "black", // Додали колір тексту
                backgroundColor: "white",
              }}
            >
              &lt;
            </button>
          )}

          {/* Кнопки для сторінок */}
          {pageNumbers.map((page, index) => (
            <button
              key={index} // Використовуємо індекс для унікального ключа
              onClick={() => handlePageChange(Number(page))}
              style={{
                padding: "8px 16px",
                fontSize: "16px",
                cursor: "pointer",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: page === currentPage ? "#39719fff" : "white",
                color: page === currentPage ? "white" : "black",
                fontWeight: page === currentPage ? "bold" : "normal",
                // Стилі для багатокрапок
                pointerEvents: page === "..." ? "none" : "auto", // Робить багатокрапки неклікабельними
                borderColor: page === "..." ? "transparent" : "#ccc",
              }}
            >
              {page}
            </button>
          ))}

          {/* Кнопка "Next" */}
          {info.next && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                padding: "8px 16px",
                fontSize: "16px",
                cursor: "pointer",
                border: "1px solid #ccc",
                borderRadius: "4px",
                color: "black", // Додали колір тексту
                backgroundColor: "white",
              }}
            >
              &gt;
            </button>
          )}
        </div>
      </main>
    </>
  );
}
