export default function Loader({ message, size = 48 }) {
  return (
    <div className="loader">
      <div
        className="loader__spinner"
        style={{ width: size, height: size }}
      />
      {message && <div className="loader__message">{message}</div>}
    </div>
  );
}
