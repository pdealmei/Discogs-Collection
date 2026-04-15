import "../css/Wishlist.css";
import RecordCard from "../components/RecordCard";
import { getWantlist } from "../services/api";
import { useState, useEffect, useMemo } from "react";

function Wishlist() {

    const [searchQuery, setSearchQuery] = useState("");
    const [records, setRecords] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWishlist = async () => {
            try {
                const wants = await getWantlist();
                const mapped = wants.map((w: any) => ({
                    id: w.id,
                    title: w.basic_information?.title ?? "Unknown title",
                    artist: w.basic_information?.artists?.[0]?.name ?? "",
                    year: w.basic_information?.year ?? "",
                    url: w.basic_information?.cover_image ?? w.basic_information?.thumb ?? "",
                }));
                setRecords(mapped);
            } catch (err: any) {
                setError(err?.message ?? "Failed to load wantlist");
            } finally {
                setLoading(false);
            }
        };
        loadWishlist();
    }, []);

    const filteredRecords = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return records;
        return records.filter((r) =>
            (r.title ?? "").toLowerCase().includes(q) ||
            (r.artist ?? "").toLowerCase().includes(q)
        );
    }, [records, searchQuery]);

    return (
        <div className="wishlist">
            <h2>Wishlist</h2>
            <form onSubmit={(e) => e.preventDefault()} className="search-form">
                <input
                    type="text"
                    placeholder="Search your wantlist..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">Search</button>
            </form>
            {loading && <div>Loading wantlist...</div>}
            {filteredRecords.length === 0 && !loading && <div>No records found</div>}
            {error && <div>{error}</div>}
            <div className="records-grid">
                {filteredRecords.map((record) => (
                    <RecordCard key={record.id} record={record} />
                ))}
            </div>
        </div>
    );
}

export default Wishlist;