export const CHALLENGES = [
  {
    id: "challenge1",
    title: "Password Cracking (MD5)",
    category: "Web/Security",
    difficulty: "Easy",
    points: 150,
    description: "Decode human patterns. Guess → MD5 → unlock the flag.",
    path: "/challenges/1",
  },
  { id:"challenge2", title:"Coming Soon", category:"—", difficulty:"Easy", points:0, description:"More challenges will appear here.", path:null },
  { id:"challenge3", title:"Coming Soon", category:"—", difficulty:"Medium", points:0, description:"More challenges will appear here.", path:null },
];

// for now: client-side flags (later we can move to server)
export const FLAGS = {
  challenge1: "Fl@g{Woohhoo!Ch@llenge1_C0mpleted}",
};
