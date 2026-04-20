
import { Separator } from "@/components/shared/ui/separator";
import { MailIcon } from "lucide-react";
import LinkedinIcon from "@/components/shared/ui/linkedin-icon";
import Header from "@/components/layout/Header";

export default function Contact() {
  return (
    <div className="mx-auto w-full">
      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

        <Header />

        <Separator className="my-5" />
        <div className="mx-auto  text-justify">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Contact Us
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We would love to hear from you! Whether you have questions, feedback,
            or just want to say hello, feel free to reach out to us.
            <br /><br />
            <MailIcon className="mr-2 inline-block" />zpal85@protonmail.com
            <br />
            <a href="https://www.linkedin.com/in/zolt%C3%A1n-p%C3%A1l-49368184/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              <LinkedinIcon className="mr-2 inline-block" />LinkedIn
            </a>
          </p>
        </div>
        </section>

    </div>
  );
}
