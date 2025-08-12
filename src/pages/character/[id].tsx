import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";

import { useRouter } from "next/router";

import styles from "@/styles/CharacterDetails.module.css";

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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${API_URL}/character/${id}`);

    if (!res.ok) {
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
  const router = useRouter();

  const details = [
    { label: "Status", value: character.status },
    { label: "Species", value: character.species },
    { label: "Gender", value: character.gender },
    { label: "Origin", value: character.origin.name },
    { label: "Location", value: character.location.name },
    { label: "Episodes", value: character.episode.length },
  ];

  return (
    <>
      <Head>
        <title>{character.name} - Rick & Morty</title>
      </Head>

      <div className={styles.container}>
        <button onClick={() => router.back()} className={styles.goBackButton}>
          &lt; Go Back
        </button>

        <div className={styles.characterInfo}>
          <h1 className={styles.characterName}>{character.name}</h1>
          <Image
            src={character.image}
            alt={character.name}
            width={300}
            height={300}
            className={styles.characterImg}
            priority
          />
          <div className={styles.characterDescription}>
            {details.map((item) => (
              <p key={item.label}>
                <strong>{item.label}:</strong> {item.value}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
