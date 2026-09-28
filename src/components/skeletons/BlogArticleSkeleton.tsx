const BlogArticleSkeleton = () => {
    return (
        <>
            {/* Article header skeleton */}
            <section className="pt-16 sm:pt-20 pb-8 sm:pb-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-3xl mx-auto">
                        <div className="h-4 w-32 bg-muted/30 rounded-lg animate-pulse mb-8" />
                        <div className="h-16 w-16 bg-muted/30 rounded-lg animate-pulse mb-6" />
                        <div className="h-10 w-full bg-muted/30 rounded-lg animate-pulse mb-6" />
                        <div className="flex gap-6 mb-6">
                            <div className="h-4 w-32 bg-muted/20 rounded-lg animate-pulse" />
                            <div className="h-4 w-24 bg-muted/20 rounded-lg animate-pulse" />
                        </div>
                        <div className="flex gap-2 mb-8">
                            <div className="h-6 w-16 bg-muted/20 rounded-full animate-pulse" />
                            <div className="h-6 w-20 bg-muted/20 rounded-full animate-pulse" />
                        </div>
                        <div className="h-6 w-full bg-muted/20 rounded-lg animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Article content skeleton */}
            <section className="py-8 pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <div key={index} className="space-y-2">
                                <div className="h-4 w-full bg-muted/20 rounded-lg animate-pulse" />
                                <div className="h-4 w-11/12 bg-muted/20 rounded-lg animate-pulse" />
                                {index % 3 === 0 && (
                                    <div className="h-32 w-full bg-muted/30 rounded-lg animate-pulse my-4" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default BlogArticleSkeleton;

