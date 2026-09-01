import { Card, Pill, ScreenHeader } from "@/components/ui";

export default function Help() {
  const faqs = [["Who can see my record?", "Only you, and anyone you approve with a one-time code. Every access is logged in Privacy & access."], ["What shows if someone scans my QR?", "Name, blood group, allergies, emergency contact and emergency medicines. Nothing else without your code."], ["Is the AI a doctor?", "No. It gives a plain-language suggestion and a next step. For emergencies call 112, or 108 for an ambulance."], ["How do I delete everything?", "Profile → Sign out → Delete account. Everything goes except entries you chose to share with a doctor."]];
  return (
    <>
      <ScreenHeader title="Help & support" back="/app/profile" />
      <Card className="p-0 divide-y divide-divider">{faqs.map(([q, a]) => <details key={q} className="p-4"><summary className="font-semibold text-[14px] cursor-pointer">{q}</summary><p className="text-[13.5px] text-muted mt-2">{a}</p></details>)}</Card>
      <Pill href="mailto:hello@vitasync.ai" className="w-full mt-5">Email hello@vitasync.ai</Pill>
      <p className="text-center text-[12px] text-faint mt-3">We reply within a day. Dehradun, IST.</p>
    </>
  );
}
