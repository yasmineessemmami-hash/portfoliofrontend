const SkillsSkeleton = () => {
  return (
    <>
      {/* Hero skeleton */}
      <section className="pt-16 sm:pt-20 pb-10 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-8 sm:h-10 w-3/4 mx-auto bg-muted/30 rounded-lg animate-pulse mb-4" />
            <div className="h-4 w-2/3 mx-auto bg-muted/20 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>

      {/* CV + socials skeleton */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-6 sm:p-8 animate-pulse">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="w-full sm:w-1/2 space-y-3">
                  <div className="h-5 w-2/3 bg-muted/30 rounded-lg" />
                  <div className="h-4 w-5/6 bg-muted/20 rounded-lg" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-1/2">
                  <div className="h-11 w-32 bg-muted/30 rounded-lg" />
                  <div className="h-11 w-32 bg-muted/20 rounded-lg" />
                  <div className="h-11 w-28 bg-muted/20 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill categories skeleton */}
      <section className="py-8 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {Array.from({ length: 4 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div
                key={index}
                className="glass rounded-2xl p-6 sm:p-8 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted/30" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/2 bg-muted/30 rounded-lg" />
                    <div className="h-4 w-3/4 bg-muted/20 rounded-lg" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  {Array.from({ length: 4 }).map((_, tagIndex) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div
                      key={tagIndex}
                      className="h-8 w-20 bg-muted/20 rounded-lg"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning focus skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 sm:p-12 animate-pulse space-y-4">
              <div className="h-6 w-1/2 mx-auto bg-muted/30 rounded-lg" />
              <div className="h-4 w-5/6 mx-auto bg-muted/20 rounded-lg" />
              <div className="h-4 w-2/3 mx-auto bg-muted/20 rounded-lg" />
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div
                    key={index}
                    className="h-8 w-24 bg-muted/20 rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SkillsSkeleton;


