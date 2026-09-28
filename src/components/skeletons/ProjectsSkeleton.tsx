const ProjectsSkeleton = () => {
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

            {/* Projects grid skeleton */}
            <section className="py-8 pb-16 sm:pb-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {Array.from({ length: 4 }).map((_, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <article
                                key={index}
                                className="glass rounded-2xl overflow-hidden animate-pulse"
                            >
                                <div className="relative h-48 sm:h-56 bg-muted/30" />
                                <div className="p-6 space-y-3">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="p-2 bg-muted/30 rounded-lg w-9 h-9" />
                                        <div className="h-5 w-2/3 bg-muted/30 rounded-lg" />
                                    </div>
                                    <div className="h-4 w-full bg-muted/20 rounded-lg" />
                                    <div className="h-4 w-5/6 bg-muted/20 rounded-lg" />
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {Array.from({ length: 3 }).map((_, badgeIndex) => (
                                            // eslint-disable-next-line react/no-array-index-key
                                            <div
                                                key={badgeIndex}
                                                className="h-6 w-16 bg-muted/20 rounded-md"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProjectsSkeleton;


