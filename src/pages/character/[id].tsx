import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";

import { useRouter } from "next/router"; // Імпортуємо useRouter

// Інтерфейс для даних персонажа
interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
  gender: string;
  origin: { name: string };
  location: { name: string };
  episode: string[];
}

interface CharacterDetailsProps {
  character: Character;
}

// Тут будемо робити запит до API та відображати інформацію про персонажа
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string };

  try {
    const res = await fetch(`https://rickandmortyapi.com/api/character/${id}`);

    if (!res.ok) {
      // Якщо персонаж не знайдений, повертаємо 404 сторінку
      return { notFound: true };
    }

    const character = await res.json();

    return {
      props: {
        character,
      },
    };
  } catch (error) {
    console.error("Failed to fetch character data:", error);
    return { notFound: true };
  }
}

export default function CharacterDetails({ character }: CharacterDetailsProps) {
  const router = useRouter(); // Ініціалізуємо хук useRouter

  return (
    <>
      <Head>
        <title>{character.name} - Rick & Morty</title>
      </Head>

      <div style={{ padding: "20px" }}>
        {/* Додаємо кнопку "Назад" */}
        <button
          onClick={() => router.back()} // Використовуємо router.back() для повернення
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            cursor: "pointer",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "white",
            color: "black",
            marginBottom: "20px",
          }}
        >
          &lt; Go Back
        </button>

        <div style={{ textAlign: "center" }}>
          <h1 style={{ marginBottom: "20px" }}>{character.name}</h1>
          <Image
            src={character.image}
            alt={character.name}
            width={300}
            height={300}
            style={{ borderRadius: "8px" }}
          />
          <div style={{ marginTop: "20px", fontSize: "18px" }}>
            <p>
              <strong>Status:</strong> {character.status}
            </p>
            <p>
              <strong>Species:</strong> {character.species}
            </p>
            <p>
              <strong>Gender:</strong> {character.gender}
            </p>
            <p>
              <strong>Origin:</strong> {character.origin.name}
            </p>
            <p>
              <strong>Location:</strong> {character.location.name}
            </p>
            <p>
              <strong>Episodes:</strong> {character.episode.length}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
