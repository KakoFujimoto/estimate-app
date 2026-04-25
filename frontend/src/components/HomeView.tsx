type HomeViewProps = {
  title: string;
};

export function HomeView({ title }: HomeViewProps): JSX.Element {
  return (
    <main className="app-shell">
      <h1 className="home-title">{title}</h1>
    </main>
  );
}
