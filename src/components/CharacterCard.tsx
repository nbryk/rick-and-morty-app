import Image from "next/image";
import Link from "next/link";

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
  return (
    // Використовуємо компонент Link і вказуємо шлях
    <Link href={`/character/${id}`}>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          margin: "10px",
          borderRadius: "8px",
          width: "200px", // Фіксована ширина
          height: "320px", // Фіксована висота
          // maxWidth: "200px",
          textAlign: "center",

          // Додаємо Flexbox для вирівнювання контенту
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Image
            src={image}
            alt={name}
            width={150} // Оберіть відповідні розміри
            height={150}
            style={{ borderRadius: "50%", marginBottom: "10px" }}
          />
          <h2>{name}</h2>
        </div>

        <div>
          <p>Species: {species}</p>
          <p>Status: {status}</p>
          {/* Можете додати посилання на детальну сторінку тут пізніше */}
        </div>
      </div>
    </Link>
  );
};

export default CharacterCard;
