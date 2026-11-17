export default function StatCard({ label, value }) {
  return (
    <div className='stat'>
      <h2>{value}</h2>
      <p>{label}</p>
    </div>
  );
}
