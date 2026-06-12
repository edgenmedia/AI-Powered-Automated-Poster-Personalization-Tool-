"use client";

import { useState } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
} from "react-image-crop";
import axios from "axios";

import "react-image-crop/dist/ReactCrop.css";

interface Props {
  posterPreview: string;
  onSaved: () => void;
}

export default function TemplateEditor({
  posterPreview,
  onSaved,
}: Props) {

  const [crop, setCrop] = useState<Crop>();

  const [mode, setMode] =
    useState<"name" | "phone">("name");

  const [nameBox, setNameBox] =
    useState<PixelCrop | null>(null);

  const [phoneBox, setPhoneBox] =
    useState<PixelCrop | null>(null);

  const [imageSize, setImageSize] =
    useState({
      naturalWidth: 0,
      naturalHeight: 0,
      displayWidth: 0,
      displayHeight: 0,
    });

  const [nameStyle, setNameStyle] =
    useState({
      font: "Poppins",
      size: 32,
      color: "#FFFFFF",
      weight: "bold",
    });

  const [phoneStyle, setPhoneStyle] =
    useState({
      font: "Roboto",
      size: 28,
      color: "#FFD700",
      weight: "normal",
    });

  const fonts = [
    "Arial",
    "Roboto",
    "Poppins",
    "Montserrat",
    "Open Sans",
    "Georgia",
    "Verdana",
  ];

  const handleComplete =
    (completedCrop: PixelCrop) => {

      if (mode === "name") {
        setNameBox(completedCrop);
      } else {
        setPhoneBox(completedCrop);
      }
    };

  const saveTemplate = async () => {

    if (!nameBox || !phoneBox) {
      alert("Please select both regions");
      return;
    }

    const scaleX =
      imageSize.naturalWidth /
      imageSize.displayWidth;

    const scaleY =
      imageSize.naturalHeight /
      imageSize.displayHeight;

    try {

      await axios.post(
        "http://127.0.0.1:8000/template/save",
        {
          name_region: {
            x: Math.round(nameBox.x * scaleX),
            y: Math.round(nameBox.y * scaleY),
            w: Math.round(nameBox.width * scaleX),
            h: Math.round(nameBox.height * scaleY),
          },

          phone_region: {
            x: Math.round(phoneBox.x * scaleX),
            y: Math.round(phoneBox.y * scaleY),
            w: Math.round(phoneBox.width * scaleX),
            h: Math.round(phoneBox.height * scaleY),
          },

          name_style: nameStyle,
          phone_style: phoneStyle,
        }
      );

      alert("Template Saved!");

      onSaved();

    } catch (err) {

      console.error(err);

      alert("Failed to save template");
    }
  };

  return (

    <div className="space-y-8">

      <div>

        <h2 className="text-3xl font-bold">
          Template Designer
        </h2>

        <p className="text-gray-500 mt-2">
          Draw the regions where Name and Phone
          should appear.
        </p>

      </div>

      {/* Mode Buttons */}

      <div className="flex gap-4">

        <button
          onClick={() => setMode("name")}
          className={`px-6 py-3 rounded-xl font-semibold ${
            mode === "name"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Name Region
        </button>

        <button
          onClick={() => setMode("phone")}
          className={`px-6 py-3 rounded-xl font-semibold ${
            mode === "phone"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Phone Region
        </button>

      </div>

      {/* Crop Area */}

      <div className="flex justify-center">

        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={handleComplete}
        >

          <img
            src={posterPreview}
            alt="Poster"
            className="max-h-[700px] rounded-2xl shadow-lg"
            onLoad={(e) => {

              const img =
                e.currentTarget;

              setImageSize({
                naturalWidth:
                  img.naturalWidth,

                naturalHeight:
                  img.naturalHeight,

                displayWidth:
                  img.width,

                displayHeight:
                  img.height,
              });
            }}
          />

        </ReactCrop>

      </div>

      {/* Coordinates */}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-blue-50 rounded-2xl p-5">

          <h3 className="font-bold mb-3">
            Name Region
          </h3>

          <pre className="text-sm">
            {JSON.stringify(
              nameBox,
              null,
              2
            )}
          </pre>

        </div>

        <div className="bg-green-50 rounded-2xl p-5">

          <h3 className="font-bold mb-3">
            Phone Region
          </h3>

          <pre className="text-sm">
            {JSON.stringify(
              phoneBox,
              null,
              2
            )}
          </pre>

        </div>

      </div>

      {/* Typography */}

      <div className="grid md:grid-cols-2 gap-8">

        {/* Name Style */}

        <div className="bg-white rounded-2xl shadow p-6">

          <h3 className="font-bold text-xl mb-4">
            Name Style
          </h3>

          <select
            value={nameStyle.font}
            onChange={(e) =>
              setNameStyle({
                ...nameStyle,
                font: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          >
            {fonts.map((font) => (

              <option key={font}>
                {font}
              </option>

            ))}
          </select>

          <label className="block mt-5">
            Font Size
          </label>

          <input
            type="range"
            min={10}
            max={80}
            value={nameStyle.size}
            onChange={(e) =>
              setNameStyle({
                ...nameStyle,
                size: Number(e.target.value),
              })
            }
            className="w-full"
          />

          <p>{nameStyle.size}px</p>

          <label className="block mt-5">
            Color
          </label>

          <input
            type="color"
            value={nameStyle.color}
            onChange={(e) =>
              setNameStyle({
                ...nameStyle,
                color: e.target.value,
              })
            }
          />

        </div>

        {/* Phone Style */}

        <div className="bg-white rounded-2xl shadow p-6">

          <h3 className="font-bold text-xl mb-4">
            Phone Style
          </h3>

          <select
            value={phoneStyle.font}
            onChange={(e) =>
              setPhoneStyle({
                ...phoneStyle,
                font: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          >
            {fonts.map((font) => (

              <option key={font}>
                {font}
              </option>

            ))}
          </select>

          <label className="block mt-5">
            Font Size
          </label>

          <input
            type="range"
            min={10}
            max={80}
            value={phoneStyle.size}
            onChange={(e) =>
              setPhoneStyle({
                ...phoneStyle,
                size: Number(e.target.value),
              })
            }
            className="w-full"
          />

          <p>{phoneStyle.size}px</p>

          <label className="block mt-5">
            Color
          </label>

          <input
            type="color"
            value={phoneStyle.color}
            onChange={(e) =>
              setPhoneStyle({
                ...phoneStyle,
                color: e.target.value,
              })
            }
          />

        </div>

      </div>

      {/* Live Preview */}

      <div className="bg-gray-100 rounded-2xl p-6">

        <h3 className="font-bold mb-4">
          Live Preview
        </h3>

        <p
          style={{
            fontFamily: nameStyle.font,
            fontSize: nameStyle.size,
            color: nameStyle.color,
            fontWeight:
              nameStyle.weight as any,
          }}
        >
          Eshank Ryshabh
        </p>

        <p
          style={{
            fontFamily: phoneStyle.font,
            fontSize: phoneStyle.size,
            color: phoneStyle.color,
            fontWeight:
              phoneStyle.weight as any,
          }}
        >
          9876543210
        </p>

      </div>

      <button
        onClick={saveTemplate}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition"
      >
        Save Template
      </button>

    </div>
  );
}