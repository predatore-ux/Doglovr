/* Editorial content. Lesson times include reading and a short practice session. */
const pic = id => `assets/${['hero', 'body', 'potty', 'train'].includes(id) ? id : 'hero'}.jpg`;

const sources = {
  "body": "https://nextgen.rspca.org.uk/kindness-hub/looking-after-dogs/dog-body-language",
  "potty": "https://science.rspca.org.uk/en/web/rspca/adviceandwelfare/pets/dogs/training/toilettraining",
  "train": "https://www.rspca.org.uk/adviceandwelfare/pets/dogs/training"
};

const lessons = [
  {
    "id": "body",
    "title": "Speak a little more dog.",
    "cat": "Body language",
    "desc": "Understand the little signals that say a lot.",
    "time": 6,
    "img": "body",
    "heading": "Read the whole dog",
    "intro": "Dogs communicate with their whole body. Look at posture, movement, face and the situation together; one signal alone does not tell the whole story.",
    "steps": [
      "A loose, wiggly body and soft eyes can suggest comfort. A play bow can invite play. Keep checking that both dogs want to join in.",
      "Freezing, turning away or a tense body can mean a dog needs distance. Stop approaching and give them room.",
      "Watch for changes from your own dog’s normal behaviour. Let a resting dog rest and let them choose whether to approach."
    ],
    "question": "A dog freezes as you approach. What should you do?",
    "answers": [
      "Keep reaching to show you are friendly",
      "Pause and give the dog space",
      "Ask for a sit before touching"
    ],
    "correct": 1
  },
  {
    "id": "potty",
    "title": "Little accidents. Big progress.",
    "cat": "Potty & pee training",
    "desc": "Build a toilet routine that works for both of you.",
    "time": 8,
    "img": "potty",
    "heading": "A fresh start for house training",
    "intro": "Pee and poo training are part of the same skill: learning where to toilet. Patience and a predictable routine make learning easier.",
    "steps": [
      "Offer outdoor toilet breaks after waking, eating and playing, and before bed. Adjust the frequency to your dog’s needs.",
      "Stay nearby. When your dog finishes in the right place, reward promptly with praise or a treat.",
      "Supervise indoors and watch for sniffing or circling. Clean accidents calmly; never punish. Keep a simple record to spot patterns."
    ],
    "question": "Your puppy has an accident indoors. What helps?",
    "answers": [
      "Clean calmly and offer more toilet opportunities",
      "Scold them so they remember",
      "Remove their water"
    ],
    "correct": 0
  },
  {
    "id": "sit",
    "title": "Small steps. Good dog energy.",
    "cat": "Everyday training",
    "desc": "Start with a sit, a reward, and a little patience.",
    "time": 5,
    "img": "train",
    "heading": "Make the first sit feel easy",
    "intro": "Choose a quiet place and a reward your dog enjoys. A few successful repetitions are a lovely place to begin.",
    "steps": [
      "Hold a small treat near the nose and move it gently upward and back. Let the dog choose to follow; do not push their body.",
      "As their bottom touches the floor, mark the moment with “yes” and give the treat.",
      "Once the movement is familiar, add “sit” just before it happens. Keep sessions short and finish while your dog is engaged."
    ],
    "question": "When should the reward arrive?",
    "answers": [
      "Only after the whole session",
      "As soon as the wanted behaviour happens",
      "Whenever the dog gets bored"
    ],
    "correct": 1
  },
  {
    "id": "recall",
    "title": "Make coming back worth it.",
    "cat": "Everyday training",
    "desc": "Build a cheerful, reliable recall from the basics.",
    "time": 7,
    "img": "hero",
    "heading": "A happy return",
    "intro": "Recall begins in an easy, enclosed space with very few distractions. Build difficulty gradually.",
    "steps": [
      "Say your dog’s name and your recall cue once, with an inviting voice, from a short distance.",
      "Reward generously when they come to you. Then let them return to a safe activity so recall does not always end the fun.",
      "Practise in different safe places. Use a long line attached to a suitable harness when needed; do not test an unproven recall near hazards."
    ],
    "question": "Where should a new recall begin?",
    "answers": [
      "A busy unfenced park",
      "A quiet enclosed space",
      "Beside a road"
    ],
    "correct": 1
  },
  {
    "id": "task",
    "title": "A place to pause.",
    "cat": "Task training",
    "desc": "Teach a useful “go to your mat” cue.",
    "time": 7,
    "img": "potty",
    "heading": "Teach a mat station",
    "intro": "A mat can be a familiar place for settling while you work or prepare a meal. Start without distractions.",
    "steps": [
      "Place a mat on the floor. Reward looking at it, then moving toward it, then stepping on it.",
      "Reward four paws on the mat. Toss a treat away to reset and give your dog another choice to return.",
      "Add a cue once returning is predictable. Gradually reward a little more time on the mat and teach a release word."
    ],
    "question": "How do you begin teaching a mat task?",
    "answers": [
      "Physically hold the dog on the mat",
      "Reward small voluntary steps toward the mat",
      "Expect a long stay immediately"
    ],
    "correct": 1
  },
  {
    "id": "care",
    "title": "The everyday essentials.",
    "cat": "Dog essentials",
    "desc": "Meet the needs behind a happy, balanced day.",
    "time": 5,
    "img": "body",
    "heading": "Build a day around your dog",
    "intro": "A good routine makes room for rest, movement, sniffing, companionship and learning. The right balance depends on the individual dog.",
    "steps": [
      "Keep fresh water available and choose a suitable diet with your veterinary team. Ask them about preventive care and any changes in health.",
      "Offer comfortable, undisturbed rest and safe activities that suit your dog’s age and ability.",
      "Provide choice: a sniffing walk, a food puzzle or a short reward-based lesson. Adjust if your dog seems overwhelmed."
    ],
    "question": "Which approach best supports learning?",
    "answers": [
      "A predictable routine with rest and rewards",
      "Long sessions without breaks",
      "Identical exercise for every dog"
    ],
    "correct": 0
  }
];

const breeds = [
  {
    "name": "Golden Retriever",
    "group": "Sporting",
    "size": "Large",
    "energy": "High",
    "img": "hero",
    "text": "Often sociable and eager to join family activities. Plan for regular exercise, retrieving games and coat care.",
    "focus": "Reward calm greetings and practise carrying or trading toys.",
    "slug": "retriever-golden"
  },
  {
    "name": "Border Collie",
    "group": "Herding",
    "size": "Medium",
    "energy": "High",
    "img": "collie",
    "text": "An active herding breed that often enjoys learning and close teamwork. Mental enrichment matters alongside movement.",
    "focus": "Teach a settle cue and offer thoughtful tasks as well as exercise.",
    "slug": "border-collie"
  },
  {
    "name": "Beagle",
    "group": "Hound",
    "size": "Small–medium",
    "energy": "High",
    "img": "beagle",
    "text": "A scent hound with a curious nose. Sniffing opportunities and secure spaces can make daily life more rewarding.",
    "focus": "Practise recall in enclosed spaces and use scent games as enrichment.",
    "slug": "beagle"
  },
  {
    "name": "Poodle",
    "group": "Non-sporting / Toy",
    "size": "Varies",
    "energy": "Active",
    "img": "train",
    "text": "Poodles come in toy, miniature and standard sizes. They are often keen learners and require regular coat maintenance.",
    "focus": "Introduce grooming cooperatively and keep training varied.",
    "slug": "poodle-standard"
  },
  {
    "name": "Labrador Retriever",
    "group": "Sporting",
    "size": "Large",
    "energy": "High",
    "img": "body",
    "text": "Often outgoing and enthusiastic about activity. Retrieving and reward-based learning can be a great match.",
    "focus": "Build loose-lead skills and polite greetings in easy steps.",
    "slug": "labrador-retriever"
  },
  {
    "name": "Mixed breed",
    "group": "Individual",
    "size": "Varies",
    "energy": "Varies",
    "img": "potty",
    "text": "A mixed-breed dog is their own individual. Appearance or guessed ancestry cannot reliably predict personality.",
    "focus": "Observe what your dog enjoys and adapt routines to their needs.",
    "slug": null
  }
];
