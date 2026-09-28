const AdminPlaceholder = ({ pageName }: { pageName: string }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground font-['Sora'] mb-2">
          {pageName}
        </h1>
        <p className="text-muted-foreground">This page is coming soon.</p>
      </div>
    </div>
  );
};

export default AdminPlaceholder;

