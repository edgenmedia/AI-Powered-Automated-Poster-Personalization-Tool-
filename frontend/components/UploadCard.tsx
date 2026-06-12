"use client";

interface Props {
  title: string;
  description: string;
  onChange: (file: File) => void;
}

export default function UploadCard({
  title,
  description,
  onChange,
}: Props) {
  return (
    <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-8 text-center hover:border-indigo-500 transition">

      <h3 className="text-2xl font-semibold mb-2">
        {title}
      </h3>

      <p className="text-gray-500 mb-6">
        {description}
      </p>

      <input
        type="file"
        className="block mx-auto"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onChange(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}