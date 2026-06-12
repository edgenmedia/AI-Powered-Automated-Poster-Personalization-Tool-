"use client";

import { useState } from "react";
import axios from "axios";

import Stepper from "../components/Stepper";
import UploadCard from "../components/UploadCard";
import TemplateEditor from "../components/TemplateEditor";

export default function Home() {
  const [step, setStep] = useState(1);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState("");

  const [contactsCsv, setContactsCsv] = useState<File | null>(null);

  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [generatedCount, setGeneratedCount] = useState(0);

  const [loading, setLoading] = useState(false);

  // ======================
  // Upload Poster
  // ======================
  const uploadPoster = async () => {
    if (!posterFile) return;

    setLoading(true);

    const form = new FormData();
    form.append("file", posterFile);

    try {
      await axios.post(
        "http://127.0.0.1:8000/upload/poster",
        form
      );

      setPosterPreview(
        URL.createObjectURL(posterFile)
      );

      alert("Poster uploaded successfully!");

      setStep(2);

    } catch (err) {
      console.error(err);

      alert("Poster upload failed");
    }

    setLoading(false);
  };

  // ======================
  // Upload Contacts
  // ======================
  const uploadContacts = async () => {
    if (!contactsCsv) return;

    setLoading(true);

    const form = new FormData();
    form.append("file", contactsCsv);

    try {
      await axios.post(
        "http://127.0.0.1:8000/upload/contacts",
        form
      );

      alert("Contacts uploaded!");

      setStep(3);

    } catch (err) {
      console.error(err);

      alert("Contacts upload failed");
    }

    setLoading(false);
  };

  // ======================
  // Generate Posters
  // ======================
  const generatePosters = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/generate/personalize"
      );

      setGeneratedFiles(
        response.data.generated_files || []
      );

      setGeneratedCount(
        response.data.generated_count || 0
      );

      alert("Posters generated successfully!");

      setStep(5);

    } catch (err) {
      console.error(err);

      alert("Generation failed");
    }

    setLoading(false);
  };

  // ======================
  // Reset Campaign
  // ======================
  const startNewCampaign = () => {
    setStep(1);

    setPosterFile(null);
    setPosterPreview("");

    setContactsCsv(null);

    setGeneratedFiles([]);
    setGeneratedCount(0);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10">

          <h1 className="text-5xl font-bold text-indigo-600">
            PosterForge AI
          </h1>

          <p className="mt-4 text-gray-600 text-lg">
            Bulk Personalized Poster Generator
          </p>

        </div>

        <Stepper currentStep={step} />

        <div className="bg-white rounded-2xl shadow-lg p-10 mt-10">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <UploadCard
                title="Upload Poster"
                description="Upload PNG/JPG poster template."
                onChange={setPosterFile}
              />

              <button
                onClick={uploadPoster}
                disabled={!posterFile || loading}
                className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-xl"
              >
                {loading
                  ? "Uploading..."
                  : "Upload Poster"}
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <UploadCard
                title="Upload Contacts CSV"
                description="CSV containing names and phone numbers."
                onChange={setContactsCsv}
              />

              <button
                onClick={uploadContacts}
                disabled={!contactsCsv || loading}
                className="mt-8 px-8 py-4 bg-green-600 text-white rounded-xl"
              >
                {loading
                  ? "Uploading..."
                  : "Upload Contacts"}
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <TemplateEditor
              posterPreview={posterPreview}
              onSaved={() => setStep(4)}
            />
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="text-center">

              <h2 className="text-3xl font-bold">
                Template Saved 🎉
              </h2>

              <p className="mt-4 text-gray-500">
                Ready to generate personalized posters.
              </p>

              <button
                onClick={generatePosters}
                disabled={loading}
                className="mt-8 px-8 py-4 bg-purple-600 text-white rounded-xl"
              >
                {loading
                  ? "Generating..."
                  : "Generate Posters"}
              </button>

            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div>

              <div className="text-center mb-8">

                <h2 className="text-3xl font-bold">
                  Posters Generated 🎉
                </h2>

                <p className="mt-4 text-gray-600">
                  Total Posters Generated:
                  <span className="font-bold ml-2">
                    {generatedCount}
                  </span>
                </p>

              </div>

              {/* Gallery */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                {generatedFiles.map((file) => (

                  <div
                    key={file}
                    className="border rounded-xl p-3 shadow"
                  >

                    <img
                      src={`http://127.0.0.1:8000/outputs/posters/${file}`}
                      alt={file}
                      className="rounded-lg"
                    />

                    <p className="mt-3 text-sm break-all">
                      {file}
                    </p>

                  </div>

                ))}

              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 mt-10 justify-center">

                <a
                  href="http://127.0.0.1:8000/generate/download"
                  className="px-8 py-4 bg-green-600 text-white rounded-xl"
                >
                  Download ZIP
                </a>

                <button
                  onClick={startNewCampaign}
                  className="px-8 py-4 bg-gray-600 text-white rounded-xl"
                >
                  Start New Campaign
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </main>
  );
}