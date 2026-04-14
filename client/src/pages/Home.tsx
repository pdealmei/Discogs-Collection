import RecordCard from "../components/RecordCard";
import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { fetchCollectionFromBackend } from "../services/api.tsx";
import "../css/Home.css";

interface Artist {
    name?: string;
    [key: string]: any;
}

interface BasicInformation {
    id?: number | string;
    title?: string;
    year?: string | number;
    artists?: Artist[];
    cover_image?: string;
    thumb?: string;
    [key: string]: any;
}

interface Release {
    id?: number | string;
    basic_information?: BasicInformation;
    [key: string]: any;
}

interface Record {
    id: string | number;
    title: string;
    artist: string;
    year?: string | number;
    url?: string;
}

const Home: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // search is handled client-side via filtering below
    };

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError("");

                const username = "paul.de.almeida";
                // const releases: Release[] = await fetchCollectionFromBackend({ username, folderId: 0 });
                // Hardcoded sample collection while backend is not implemented
                const releases: Release[] = [
                    {
                        id: 1,
                        basic_information: {
                            title: "Abbey Road",
                            year: 1969,
                            artists: [{ name: "The Beatles" }],
                            cover_image: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg"
                        }
                    },
                    {
                        id: 2,
                        basic_information: {
                            title: "Kind of Blue",
                            year: 1959,
                            artists: [{ name: "Miles Davis" }],
                            cover_image: "https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg"
                        }
                    },
                    {
                        id: 3,
                        basic_information: {
                            title: "Back to Black",
                            year: 2006,
                            artists: [{ name: "Amy Winehouse" }],
                            cover_image: "https://upload.wikimedia.org/wikipedia/en/2/2e/Amy_Winehouse_-_Back_to_Black_%28album%29.png"
                        }
                    }
                ];
     

                const mapped: Record[] = releases.map((r: Release) => {
                    const info: BasicInformation = r?.basic_information ?? {};
                    const firstArtist: Artist | null = Array.isArray(info?.artists) ? info.artists[0] : null;
                    const artistName: string = firstArtist?.name ?? "";

                    return {
                        id: r?.id ?? info?.id ?? `${artistName}-${info?.title}-${info?.year}`,
                        title: info?.title ?? "Unknown title",
                        artist: artistName,
                        year: info?.year ?? "",
                        url: info?.cover_image ?? info?.thumb ?? "",
                    };
                });

                if (!cancelled) setRecords(mapped);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load collection");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search your records"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">Search</button>
            </form>
            {loading && <div>Loading collection...</div>}
            {error && <div>{error}</div>}
            <div className="records-grid">
                {records
                    .filter((r) => {
                        const q = searchQuery.toLowerCase().trim();
                        if (!q) return true;
                        return (
                            (r.title ?? "").toLowerCase().includes(q) ||
                            (r.artist ?? "").toLowerCase().includes(q)
                        );
                    })
                    .map((record) => (
                        <RecordCard key={record.id} record={record} />
                    ))}
            </div>
        </div>
    );
};

export default Home;