import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Faq() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
      <p className="text-lg text-gray-500 mb-8 text-center">
        Here are some of the most common questions we receive. If you have any
        other questions, please don&apos;t hesitate to contact us.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" id="item-1">
              <AccordionTrigger>
                What is the purpose of this healthcare application?
              </AccordionTrigger>
              <AccordionContent id="item-1">
                The application aims to enhance patient engagement, streamline
                medical services, and improve healthcare delivery by providing
                tools for appointment scheduling, health record management, and
                patient-doctor interaction.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Who can use this application?</AccordionTrigger>
              <AccordionContent>
                The application is designed for patients, doctors, and
                healthcare providers. Patients can manage their health records,
                schedule appointments, and interact with doctors. Doctors can
                monitor patient records, prescribe medications, and communicate
                with patients. Healthcare providers can manage resources, track
                appointments, and streamline administrative tasks.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                How secure is my personal health information?
              </AccordionTrigger>
              <AccordionContent>
                We prioritize the security of your data. The application uses
                advanced encryption and data protection measures to ensure the
                confidentiality and integrity of your sensitive health
                information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" id="item-4">
              <AccordionTrigger>
                How does the digital prescription download feature work?
              </AccordionTrigger>
              <AccordionContent>
                Our digital prescription system allows you to securely download
                your prescriptions anytime, anywhere. After your doctor issues a
                prescription, it becomes instantly available in your account for
                download, making it easier to share with pharmacies or keep for
                your records.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-5" id={"item-5"} >
              <AccordionTrigger >
                How can the AI chat feature assist me?
              </AccordionTrigger>
              <AccordionContent >
                Our AI chat feature provides general information about medical
                conditions and healthcare topics. While it can help you better
                understand health-related topics, please note that it is not a
                substitute for professional medical advice. Always consult with
                your healthcare provider for medical decisions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6" id="item-6">
              <AccordionTrigger>
                How does the medication reminder system work?
              </AccordionTrigger>
              <AccordionContent>
                Our medication reminder system helps you stay on track with your
                prescriptions. You can input your medication schedule, and the
                app will send you timely reminders for each dose. You can also
                track your medication history and set up refill reminders to
                ensure you never run out of important medications.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7" id="item-7">
              <AccordionTrigger>
                What types of notifications will I receive?
              </AccordionTrigger>
              <AccordionContent>
                You&apos;ll receive notifications for upcoming medical
                appointments, medication reminders, prescription renewals, and
                any important updates from your healthcare providers. You can
                customize your notification preferences to ensure you receive
                the alerts that matter most to you.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-8" id="item-8">
              <AccordionTrigger>
                How can I access my medical records?
              </AccordionTrigger>
              <AccordionContent>
                Your complete medical records are securely stored and easily
                accessible through your patient portal. You can view your test
                results, medical history, immunization records, and treatment
                plans anytime. You can also download or share these records with
                other healthcare providers when needed.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
