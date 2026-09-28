const FAQSkeleton = () => {
    return (
        <>
            {/* Hero skeleton */}
            <section className="pt-16 sm:pt-20 pb-10 sm:pb-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted/30 animate-pulse mx-auto mb-6" />
                        <div className="h-8 sm:h-10 w-3/4 mx-auto bg-muted/30 rounded-lg animate-pulse mb-4" />
                        <div className="h-4 w-2/3 mx-auto bg-muted/20 rounded-lg animate-pulse" />
                    </div>
                </div>
            </section>

            {/* FAQ accordion skeleton */}
            <section className="py-8 pb-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <div
                                key={index}
                                className="glass rounded-xl p-6 animate-pulse"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-5 w-3/4 bg-muted/30 rounded-lg" />
                                    <div className="w-5 h-5 bg-muted/30 rounded" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-muted/20 rounded-lg" />
                                    <div className="h-4 w-5/6 bg-muted/20 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default FAQSkeleton;

