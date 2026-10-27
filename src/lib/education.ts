// Content for the Learn page. Kept separate from the page layout so the
// text can be updated without touching any code.

export type SpeciesInfo = {
  name: string; // must match the "species" value in the API data
  latinName: string;
  alsoKnownAs?: string;
  hosts: string;
  habitat: string;
  ukRange: string;
  riskToPeopleAndPets: string;
};

// Sources: ESCCAP UK species pages (esccapuk.org.uk) and the Provisional
// Atlas of the Ticks of the British Isles (Martyn, 1988).
export const SPECIES: SpeciesInfo[] = [
  {
    name: "Fox/badger tick",
    latinName: "Ixodes canisuga",
    alsoKnownAs: "British dog tick",
    hosts: "Foxes, badgers and dogs; also sheep, horses and cats.",
    habitat: "Dens, burrows and kennels. It copes with drier conditions than most ticks.",
    ukRange: "Throughout the UK, especially wetter areas of western and northern England and Scotland.",
    riskToPeopleAndPets:
      "Mainly a concern for dogs. Large numbers can cause itching, hair loss and anaemia.",
  },
  {
    name: "Passerine tick",
    latinName: "Dermacentor frontalis",
    alsoKnownAs: "Usually classified as Ixodes frontalis",
    hosts: "Ground-feeding songbirds such as thrushes, tits, warblers and pigeons.",
    habitat: "Bird nests and roosts in woodland, hedgerows, parks and gardens.",
    ukRange: "South-east England and the west and north coasts of England.",
    riskToPeopleAndPets: "Rarely found on people or pets. It mainly feeds on birds.",
  },
  {
    name: "Tree-hole tick",
    latinName: "Ixodes arboricola",
    hosts: "Birds that nest in holes, such as blue tits, great tits, woodpeckers and starlings, and bats.",
    habitat: "Nests in tree holes and nest boxes, and cave entrances.",
    ukRange: "Southern England.",
    riskToPeopleAndPets: "Rarely found on people or pets, as it stays in nests.",
  },
  {
    name: "Southern rodent tick",
    latinName: "Ixodes acuminatus",
    hosts: "Small rodents such as mice and voles.",
    habitat: "Inside rodent burrows.",
    ukRange: "Recorded in the Isles of Scilly and coastal Cornwall and Devon.",
    riskToPeopleAndPets: "Rarely found on people or pets. Little is known about its biology.",
  },
  {
    name: "Marsh tick",
    latinName: "Ixodes apronophorus",
    hosts: "Water voles and other small mammals in wet areas.",
    habitat: "Marshes, fens and other wetlands.",
    ukRange: "Mainly recorded around the Norfolk Broads and Wicken Fen.",
    riskToPeopleAndPets: "Rarely found on people or pets.",
  },
];

export type Tip = { title: string; detail: string };

// Source: NHS, "Lyme disease" (nhs.uk/conditions/lyme-disease).
export const TIPS_FOR_PEOPLE: Tip[] = [
  { title: "Stick to paths", detail: "Keep to clear paths and avoid brushing through long grass and bracken." },
  { title: "Cover up", detail: "Wear long sleeves and tuck your trousers into your socks." },
  { title: "Wear light colours", detail: "Ticks are easier to spot and brush off light-coloured clothes." },
  { title: "Use repellent", detail: "Use insect repellent on skin and clothes. Products containing DEET work best." },
  { title: "Check after walks", detail: "Check yourself, children and pets for ticks after being outdoors." },
  { title: "Check hidden spots", detail: "Ticks like warm places, so check behind your knees, armpits, waistband and hairline." },
];

// Source: ESCCAP UK, "Ticks" (esccapuk.org.uk).
export const TIPS_FOR_PETS: Tip[] = [
  {
    title: "Check daily",
    detail: "Look in thin-skinned areas: face, ears, armpits, between the toes and around the groin.",
  },
  {
    title: "Use a tick treatment",
    detail: "Ask your vet about a tick treatment and follow the label for how often to reapply.",
  },
  {
    title: "Never use dog products on cats",
    detail: "Some dog tick treatments are toxic to cats, so always use a product made for cats.",
  },
  {
    title: "Take extra care in peak season",
    detail: "Ticks are most active from March to June and again from August to October.",
  },
];

// Source: NHS, "Lyme disease".
export const REMOVAL_STEPS: string[] = [
  "Use fine-tipped tweezers or a tick removal tool.",
  "Grip the tick as close to the skin as possible.",
  "Pull upwards slowly and steadily, without squeezing or crushing the tick.",
  "Clean the bite with antiseptic or soap and water.",
];

export const WHEN_TO_GET_HELP =
  "Contact a GP or call NHS 111 if you've been bitten (or spent time in a tick area) in the last 3 months and get a circular or oval rash, or flu-like symptoms such as a fever, headache or aching muscles.";
