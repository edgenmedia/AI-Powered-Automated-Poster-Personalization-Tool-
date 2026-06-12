"use client";

import { useState } from "react";
import axios from "axios";

export default function GeneratePage() {

    const [file, setFile] =
        useState<File | null>(null);

    const [generatedCount,
        setGeneratedCount] =
        useState<number | null>(null);

    const [generatedFiles,
        setGeneratedFiles] =
        useState<string[]>([]);

    const uploadContacts =
        async () => {

        if (!file) {
            alert(
                "Please select CSV/XLSX"
            );
            return;
        }

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

        try {

            await axios.post(
                "http://localhost:8000/upload/contacts",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            alert(
                "Contacts uploaded successfully!"
            );

        } catch (err) {

            console.error(err);

            alert(
                "Contact upload failed"
            );
        }
    };


    const generatePosters =
        async () => {

        try {

            const response =
                await axios.post(
                    "http://localhost:8000/generate/personalize"
                );

            setGeneratedCount(
                response.data.generated_count
            );

            setGeneratedFiles(
                response.data.generated_files
            );

            alert(
                `Generated ${response.data.generated_count} posters`
            );

        } catch (err) {

            console.error(err);

            alert(
                "Poster generation failed"
            );
        }
    };


    const downloadZip =
        () => {

        window.open(
            "http://localhost:8000/generate/download",
            "_blank"
        );
    };


    return (

        <div
            style={{
                padding: "40px",
                fontFamily: "Arial"
            }}
        >

            <h1>
                PosterForge Generator
            </h1>

            <br />

            <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) =>
                    setFile(
                        e.target.files?.[0] || null
                    )
                }
            />

            <br />
            <br />

            <button
                onClick={uploadContacts}
                style={{
                    marginRight: "10px",
                    padding: "10px"
                }}
            >
                Upload Contacts
            </button>

            <button
                onClick={generatePosters}
                style={{
                    marginRight: "10px",
                    padding: "10px"
                }}
            >
                Generate Posters
            </button>

            <button
                onClick={downloadZip}
                style={{
                    padding: "10px"
                }}
            >
                Download ZIP
            </button>

            <br />
            <br />

            {
                generatedCount !== null && (

                    <div>

                        <h3>
                            Generated:
                            {" "}
                            {generatedCount}
                            {" "}
                            posters
                        </h3>

                        <ul>

                            {
                                generatedFiles.map(
                                    (
                                        file,
                                        index
                                    ) => (

                                        <li
                                            key={index}
                                        >
                                            {file}
                                        </li>
                                    )
                                )
                            }

                        </ul>

                    </div>
                )
            }

        </div>
    );
}