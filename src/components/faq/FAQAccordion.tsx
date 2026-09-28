import { useState } from "react";
import type { FAQItem as FAQItemType } from "@/types/faq.types";
import FAQItem from "@/components/faq/FAQItem";

interface FAQAccordionProps {
    faqs: FAQItemType[];
}

const FAQAccordion = ({ faqs }: FAQAccordionProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    if (!faqs || faqs.length === 0) {
        return (
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-2xl mx-auto text-center text-muted-foreground">
                        <p className="text-base sm:text-lg">
                            No FAQs available yet. Please check back soon.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-8 pb-20">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={faq.id}
                                faq={faq}
                                index={index}
                                isOpen={openIndex === index}
                                onToggle={() => handleToggle(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQAccordion;

