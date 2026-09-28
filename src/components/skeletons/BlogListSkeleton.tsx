const BlogListSkeleton = () => {
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

            {/* Posts grid skeleton */}
            <section className="py-8 pb-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <article
                                    key={index}
                                    className="glass rounded-2xl p-6 animate-pulse"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-muted/30 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-5 w-3/4 bg-muted/30 rounded-lg" />
                                            <div className="h-4 w-full bg-muted/20 rounded-lg" />
                                            <div className="h-4 w-5/6 bg-muted/20 rounded-lg" />
                                            <div className="flex gap-4 mt-4">
                                                <div className="h-3 w-20 bg-muted/20 rounded-lg" />
                                                <div className="h-3 w-16 bg-muted/20 rounded-lg" />
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <div className="h-5 w-16 bg-muted/20 rounded" />
                                                <div className="h-5 w-20 bg-muted/20 rounded" />
                                                <div className="h-5 w-24 bg-muted/20 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default BlogListSkeleton;

