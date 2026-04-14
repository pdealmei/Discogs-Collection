import "../css/RecordCard.css";

interface RecordCardProps {
    record: {
        title?: string;
        artist?: string;
        year?: string | number;
        release_date?: string;
        url?: string;
        cover_image?: string;
        thumb?: string;
        [key: string]: any;
    };
}

const RecordCard: React.FC<RecordCardProps> = ({ record }) => {
    const imageUrl: string =
        record?.url || record?.cover_image || record?.thumb || "";
    const subtitle: string =
        record?.artist
            ? `${record.artist}${record?.year ? ` • ${record.year}` : ""}`
            : record?.release_date ?? record?.year?.toString() ?? "";

    return (
        <div className="record-card">
            <div className="record-cover">
                {imageUrl ? (
                    <img src={imageUrl} alt={record?.title ?? "Cover"} />
                ) : (
                    <div className="record-placeholder" />
                )}
            </div>
            <div className="record-info">
                <h3>{record.title}</h3>
                <p>{subtitle}</p>
            </div>
        </div>
    );
};

export default RecordCard;