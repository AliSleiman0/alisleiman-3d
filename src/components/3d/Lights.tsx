export function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 3, 5]} intensity={2.2} color="#8b8cf5" />
      {/* Rim light from behind gives the silhouette a bright indigo edge. */}
      <directionalLight position={[-3, 1, -6]} intensity={3} color="#818cf8" />
      <pointLight position={[5, 4, 7]} intensity={0.8} color="#6366f1" />
    </>
  );
}
