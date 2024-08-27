import ContactForm from "./ContactForm";

export default function Contact() {


    return (
        <section className="flex flex-col md:flex-row justify-around py-20">
            <article className="text-center md:text-start md:mt-28 mt-10 mb-10">
                <h2 className="text-5xl">Get in touch</h2>
                <p className="text-xl">We’d love to help</p>
            </article>
            <article>
                <ContactForm />
            </article>
        </section>

    )


}