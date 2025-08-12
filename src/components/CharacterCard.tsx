import Image from "next/image";
import Link from "next/link";

import styles from "@/styles/CharacterCard.module.css";

interface CharacterProps {
  id: number;
  name: string;
  image: string;
  species: string;
  status: string;
}

const CharacterCard: React.FC<CharacterProps> = ({
  id,
  name,
  image,
  species,
  status,
}) => {
  const statusClassName =
    {
      alive: styles.statusAlive,
      dead: styles.statusDead,
      unknown: styles.statusUnknown,
    }[status.toLowerCase()] || styles.statusUnknown;

  return (
    <Link href={`/character/${id}`}>
      <div className={styles.card}>
        <div>
          <Image
            src={image}
            alt={name}
            width={160}
            height={160}
            className={styles.image}
          />
          <h2 className={styles.name}>{name}</h2>
        </div>

        <div className={styles.details}>
          <p>Species: {species}</p>
          <p className={styles.statusSpecies}>
            <span
              className={`${styles.statusIcon} ${statusClassName || ""}`}
            ></span>{" "}
            {/* Виправлення тут */}
            Status: {status}
          </p>
          {/* Можете додати посилання на детальну сторінку тут пізніше */}
        </div>
      </div>
    </Link>
  );
};

export default CharacterCard;
