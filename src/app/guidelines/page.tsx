const GUIDELINES = [
  {
    lead: "Respect and brotherhood.",
    body: "Iron sharpens iron, it doesn't tear down. Disagreement is fine. Personal attacks, insults, and tearing another man down are not.",
  },
  {
    lead: "Grace across differences.",
    body: "We won't all agree on every point of doctrine or every denominational distinctive, and that's alright. What we hold in common is what matters most: Jesus Christ is our one true Lord and Savior, who paid for our salvation with His own blood. Look at every issue, political or theological, through the lens of the Gospel first.",
  },
  {
    lead: "Purity in what's shared.",
    body: "No explicit, vulgar, or sexually inappropriate content of any kind, in posts, comments, or shared resources.",
  },
  {
    lead: "No spam or self-promotion.",
    body: "This space is for the brotherhood, not for advertising a business, a side hustle, or unrelated links.",
  },
  {
    lead: "Prayer requests are sacred, not a joke.",
    body: "Genuine requests only. This isn't the place to test the waters or stir something up.",
  },
  {
    lead: "What's shared here stays here.",
    body: "Don't repeat or screenshot another man's testimony, prayer request, or check-in outside this community without his permission. Trust is the foundation of this brotherhood.",
  },
  {
    lead: "Consequences.",
    body: "Violating these guidelines may result in a comment being removed, a message from an admin, or, in serious or repeated cases, a restriction or ban from the community. This isn't about punishment, it's about protecting a space worth protecting.",
  },
];

export default function GuidelinesPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-offwhite">Community Guidelines</h1>
      <p className="mt-4 text-offwhite">
        This is a brotherhood, not just an app. These guidelines exist so
        that every man here can trust this is a safe, honest place to be
        known, to struggle out loud, and to be sharpened, not torn down.
      </p>

      <ul className="mt-6 flex flex-col gap-4">
        {GUIDELINES.map((g) => (
          <li key={g.lead} className="text-offwhite">
            <span className="font-semibold">{g.lead}</span> {g.body}
          </li>
        ))}
      </ul>
    </main>
  );
}
