const ContactSkeleton = () => {
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

            {/* Content skeleton */}
            <section className="py-8 pb-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid lg:grid-cols-5 gap-8">
                            {/* Contact Info skeleton */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="glass rounded-2xl p-6 sm:p-8 animate-pulse">
                                    <div className="h-6 w-48 bg-muted/30 rounded-lg mb-6" />
                                    <div className="space-y-4">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            // eslint-disable-next-line react/no-array-index-key
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-muted/30" />
                                                <div className="flex-1">
                                                    <div className="h-4 w-20 bg-muted/20 rounded mb-2" />
                                                    <div className="h-4 w-32 bg-muted/30 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="glass rounded-2xl p-6 sm:p-8 animate-pulse">
                                    <div className="h-6 w-40 bg-muted/30 rounded-lg mb-6" />
                                    <div className="grid grid-cols-2 gap-3">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            // eslint-disable-next-line react/no-array-index-key
                                            <div key={i} className="h-12 bg-muted/20 rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Form skeleton */}
                            <div className="lg:col-span-3">
                                <div className="glass rounded-2xl p-6 sm:p-8 animate-pulse">
                                    <div className="h-6 w-48 bg-muted/30 rounded-lg mb-6" />
                                    <div className="space-y-6">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="h-12 bg-muted/20 rounded-lg" />
                                            <div className="h-12 bg-muted/20 rounded-lg" />
                                        </div>
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            // eslint-disable-next-line react/no-array-index-key
                                            <div key={i} className="h-12 bg-muted/20 rounded-lg" />
                                        ))}
                                        <div className="h-12 bg-muted/30 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ContactSkeleton;

