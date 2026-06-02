import heroImg from "@/assets/hero-campus.jpg";
import sportsImg from "@/assets/sports.jpg";
import graduationImg from "@/assets/graduation.jpg";
import classroomImg from "@/assets/classroom.jpg";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "admissions-open-2026",
    title: "Admissions Open for the 2026 Academic Session",
    excerpt: "Applications are now being accepted for all sections — Montessori through Intermediate. Limited seats available.",
    date: "2026-05-15",
    category: "Announcements",
    image: heroImg,
    body: [
      "We are pleased to announce that admissions for the 2026 academic session are now open across all sections of The Aiman's School Umerkot.",
      "Parents are encouraged to apply early as seats are limited, especially in Montessori and Primary. Visit our admissions page to submit an inquiry online or call us to schedule a campus tour.",
      "We look forward to welcoming new families into the Aiman's community.",
    ],
  },
  {
    slug: "annual-sports-day-recap",
    title: "Annual Sports Day: A Day of Energy and Pride",
    excerpt: "Our students lit up the field at this year's Annual Sports Day with athletics, team games and a memorable closing ceremony.",
    date: "2026-04-22",
    category: "Events",
    image: sportsImg,
    body: [
      "This year's Annual Sports Day was a celebration of athleticism, teamwork and pure joy. From the Montessori races to the senior relay finals, every student had a moment to shine.",
      "We are deeply grateful to the parents who came out in numbers to cheer their children on — your support means everything.",
    ],
  },
  {
    slug: "matric-results-2026",
    title: "Outstanding Matric Results — 98% Pass Rate",
    excerpt: "Heartfelt congratulations to our Matric students for achieving a 98% pass rate with multiple distinctions across subjects.",
    date: "2026-03-10",
    category: "Results",
    image: graduationImg,
    body: [
      "Alhamdulillah, our Matric students have once again delivered outstanding results in the Sindh Board examinations, with a 98% pass rate and several students securing distinctions.",
      "We thank our dedicated teachers, supportive parents and hardworking students for making this possible.",
    ],
  },
  {
    slug: "smart-classrooms-rollout",
    title: "Smart Classrooms Now in Every Section",
    excerpt: "We have completed the rollout of interactive smart boards across all classrooms — bringing digital learning to every student.",
    date: "2026-02-01",
    category: "Campus",
    image: classroomImg,
    body: [
      "As part of our ongoing commitment to modern education, we have completed the installation of interactive smart boards in every classroom across the campus.",
      "These tools allow teachers to integrate video, simulations and digital content into everyday lessons, making learning more engaging and effective.",
    ],
  },
];
