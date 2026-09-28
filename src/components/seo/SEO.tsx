import { Helmet } from "@dr.pogodin/react-helmet";
import type { MetaLanguage } from "@/types/seo.types";

interface SEOProps {
    meta: MetaLanguage | null;
}

/**
 * Reusable SEO component for all pages
 * Safely injects metadata without blocking rendering
 */
const SEO = ({ meta }: SEOProps) => {
    // If no meta data, don't render anything (graceful degradation)
    if (!meta) {
        return null;
    }

    const keywordsString = meta.keywords?.join(", ") || "";

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{meta.title}</title>
            <meta name="title" content={meta.title} />
            <meta name="description" content={meta.description} />
            {keywordsString.length > 0 && (
                <meta name="keywords" content={keywordsString} />
            )}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={meta.title} />
            <meta property="og:description" content={meta.description} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
        </Helmet>
    );
};

export default SEO;

