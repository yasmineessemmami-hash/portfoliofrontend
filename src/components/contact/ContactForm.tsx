import { useState, useEffect } from "react";
import { Send, CheckCircle, ChevronDown, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { contactService } from "@/services/contact.service";
import type { ContactForm as ContactFormType, FormField } from "@/types/contact.types";

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string;

interface ContactFormProps {
    form: ContactFormType;
}

const ContactForm = ({ form }: ContactFormProps) => {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Initialize form data from fields
    useEffect(() => {
        const initialData: Record<string, string> = {};
        form.fields.forEach((field) => {
            initialData[field.name] = "";
        });
        setFormData(initialData);
    }, [form.fields]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        if (submitError) setSubmitError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        const submissionData: Record<string, string> = {};
        form.fields.forEach((field) => {
            submissionData[field.name] = formData[field.name] || "";
        });

        // Build EmailJS template params — these match the template variables
        const templateParams = {
            from_name:    submissionData.name    || "",
            from_email:   submissionData.email   || "",
            company:      submissionData.company  || "N/A",
            reason:       submissionData.reason   || "",
            budget:       submissionData.budget   || "",
            timeline:     submissionData.timeline || "",
            subject:      submissionData.subject  || "Portfolio Contact",
            message:      submissionData.message  || "",
            to_email:     "yasmineessemmami@gmail.com",
            reply_to:     submissionData.email   || "",
        };

        try {
            // 1️⃣ Send email directly to Yasmine via EmailJS
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );

            // 2️⃣ Also save submission to backend database (best-effort)
            try {
                await contactService.submitContactForm(submissionData);
            } catch {
                // Backend save failure doesn't block success — email already sent
            }

            setIsSubmitted(true);

            // Reset form after 4 seconds
            setTimeout(() => {
                const resetData: Record<string, string> = {};
                form.fields.forEach((field) => {
                    resetData[field.name] = "";
                });
                setFormData(resetData);
                setIsSubmitted(false);
            }, 4000);
        } catch (error) {
            console.error("Failed to send message:", error);
            setSubmitError(
                "Failed to send your message. Please try again or email directly at yasmineessemmami@gmail.com"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        const commonProps = {
            id: field.name,
            name: field.name,
            value: formData[field.name] || "",
            onChange: handleChange,
            required: field.required,
            placeholder: field.placeholder,
            className:
                "w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors",
        };

        switch (field.type) {
            case "textarea":
                return (
                    <textarea
                        {...commonProps}
                        rows={5}
                        className={`${commonProps.className} resize-none`}
                    />
                );

            case "select":
                return (
                    <div className="relative">
                        <select
                            {...commonProps}
                            className={`${commonProps.className} appearance-none cursor-pointer`}
                        >
                            {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                            aria-hidden="true"
                        />
                    </div>
                );

            case "email":
                return <input {...commonProps} type="email" />;

            case "text":
            default:
                return <input {...commonProps} type="text" />;
        }
    };

    return (
        <motion.div
            className="glass rounded-2xl p-6 sm:p-8"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
        >
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
                Send Me a Message
            </h2>

            {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-success" aria-hidden="true" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                        Message Sent!
                    </h3>
                    <p className="text-muted-foreground">
                        Thanks for reaching out. I&apos;ll get back to you soon.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error alert */}
                    {submitError && (
                        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                            <span>{submitError}</span>
                        </div>
                    )}
                    {/* Name and Email in grid */}
                    {form.fields.length >= 2 && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {form.fields.slice(0, 2).map((field) => (
                                <div key={field.name}>
                                    <label
                                        htmlFor={field.name}
                                        className="block text-sm font-medium text-foreground mb-2"
                                    >
                                        {field.label}{" "}
                                        {field.required ? (
                                            <span className="text-primary">*</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">
                                                (optional)
                                            </span>
                                        )}
                                    </label>
                                    {renderField(field)}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Company (single field) */}
                    {form.fields[2] && (
                        <div>
                            <label
                                htmlFor={form.fields[2].name}
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                {form.fields[2].label}{" "}
                                {form.fields[2].required ? (
                                    <span className="text-primary">*</span>
                                ) : (
                                    <span className="text-muted-foreground text-xs">
                                        (optional)
                                    </span>
                                )}
                            </label>
                            {renderField(form.fields[2])}
                        </div>
                    )}
                    
                    {/* Reason (single field) */}
                    {form.fields[3] && (
                        <div>
                            <label
                                htmlFor={form.fields[3].name}
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                {form.fields[3].label}{" "}
                                {form.fields[3].required ? (
                                    <span className="text-primary">*</span>
                                ) : (
                                    <span className="text-muted-foreground text-xs">
                                        (optional)
                                    </span>
                                )}
                            </label>
                            {renderField(form.fields[3])}
                        </div>
                    )}
                    
                    {/* Budget and Timeline in grid */}
                    {form.fields.length > 4 && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {form.fields.slice(4, 6).map((field) => (
                                <div key={field.name}>
                                    <label
                                        htmlFor={field.name}
                                        className="block text-sm font-medium text-foreground mb-2"
                                    >
                                        {field.label}{" "}
                                        {field.required ? (
                                            <span className="text-primary">*</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">
                                                (optional)
                                            </span>
                                        )}
                                    </label>
                                    {renderField(field)}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Remaining fields (Message) */}
                    {form.fields.slice(6).map((field) => (
                        <div key={field.name}>
                            <label
                                htmlFor={field.name}
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                {field.label}{" "}
                                {field.required ? (
                                    <span className="text-primary">*</span>
                                ) : (
                                    <span className="text-muted-foreground text-xs">
                                        (optional)
                                    </span>
                                )}
                            </label>
                            {renderField(field)}
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" aria-hidden="true" />
                                Send Message
                            </>
                        )}
                    </button>
                </form>
            )}
        </motion.div>
    );
};

export default ContactForm;

