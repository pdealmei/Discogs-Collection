import RecordCard from "../components/RecordCard";
import { useEffect, useMemo, useState } from "react";
import { getCollection } from "../services/api";
import "../css/Home.css";

const Home: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [records, setRecords] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCollection = async () => {
            try {
                const releases = await getCollection();
                const mapped = releases.map((r: any) => ({
                    id: r.id,
                    title: r.basic_information?.title ?? "Unknown title",
                    artist: r.basic_information?.artists?.[0]?.name ?? "",
                    year: r.basic_information?.year ?? "",
                    url: r.basic_information?.cover_image ?? r.basic_information?.thumb ?? "",
                }));
                setRecords(mapped);
            } catch (err: any) {
                setError(err?.message ?? "Failed to load collection");
            } finally {
                setLoading(false);
            }
        };
        loadCollection();
    }, []);

    const filteredRecords = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return records;
        return records.filter((r: any) =>
            (r.title ?? "").toLowerCase().includes(q) ||
            (r.artist ?? "").toLowerCase().includes(q)
        );
    }, [records, searchQuery]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    return (
        <div className="home">
            <form onSubmit={handleSearch}>  
                <input
                type="text"
                placeholder="Search for records..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">
                Search
                </button>
            </form>
            {loading && <div>Loading collection...</div>}
            {error && <div>{error}</div>}
            {filteredRecords.length === 0 && !loading && <div>No records found</div>}
            <div className="records-grid">
                {filteredRecords.map((record) => (
                    <RecordCard key={record.id} record={record} />
                ))}
            </div>
        </div>
    );
};

export default Home;