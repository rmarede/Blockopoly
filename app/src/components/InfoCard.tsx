export default function InfoCard({ title,  children } : { title: string, children: React.ReactNode }) {
    return (
        <div className="infoCard">
            <h3 className="title">{title}</h3>
            {children}
        </div>
    )
}