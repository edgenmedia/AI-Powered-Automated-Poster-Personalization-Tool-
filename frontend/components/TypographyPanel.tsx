"use client";

interface Props {
  title: string;
  style: any;
  setStyle: (s: any) => void;
}

const fonts = [
  "Arial",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Open Sans",
  "Playfair Display",
  "Bebas Neue",
];

export default function TypographyPanel({
  title,
  style,
  setStyle,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">

      <h3 className="font-bold text-xl mb-4">
        {title}
      </h3>

      <label className="block mb-2">
        Font
      </label>

      <select
        value={style.font}
        onChange={(e) =>
          setStyle({
            ...style,
            font: e.target.value,
          })
        }
        className="w-full border rounded p-2"
      >
        {fonts.map((f) => (
          <option key={f}>
            {f}
          </option>
        ))}
      </select>

      <label className="block mt-4 mb-2">
        Font Size
      </label>

      <input
        type="range"
        min={10}
        max={80}
        value={style.size}
        onChange={(e) =>
          setStyle({
            ...style,
            size: Number(e.target.value),
          })
        }
        className="w-full"
      />

      <p>
        {style.size}px
      </p>

      <label className="block mt-4 mb-2">
        Font Color
      </label>

      <input
        type="color"
        value={style.color}
        onChange={(e) =>
          setStyle({
            ...style,
            color: e.target.value,
          })
        }
      />

      <label className="block mt-4 mb-2">
        Weight
      </label>

      <select
        value={style.weight}
        onChange={(e) =>
          setStyle({
            ...style,
            weight: e.target.value,
          })
        }
        className="w-full border rounded p-2"
      >
        <option>normal</option>
        <option>bold</option>
      </select>

    </div>
  );
}