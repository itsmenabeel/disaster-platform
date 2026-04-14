const Overlay = ({ status, retry }) => {
  if (status === "loading") {
    return <div className="overlay">📡 Loading GPS...</div>;
  }

  if (status === "error") {
    return (
      <div className="overlay">
        GPS Error
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return null;
};

export default Overlay;
