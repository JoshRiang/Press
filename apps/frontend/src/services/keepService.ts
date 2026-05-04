import { WorkoutSession } from "./sessionService";

// const KEEP_API_URL = "http://127.0.0.1:8000/keep/new";
const KEEP_API_URL = "https://emas-3-calendar-fetcher.vercel.app/keep/new";

interface KeepExerciseGroup {
  name: string;
  entries: string[];
  totalVolume: number;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatSessionDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function buildKeepContent(session: WorkoutSession) {
  const groups = new Map<string, KeepExerciseGroup>();

  for (const log of session.logs) {
    const [weight = "0", sets = "0", reps = "0"] = log.log_data.replace(/,/g, ".").split("x").map((part) => part.trim());
    const exerciseVolume = Number(weight) * Number(sets) * Number(reps);

    const existing = groups.get(log.exercise_name);
    if (existing) {
      existing.entries.push(`${weight}x${sets}x${reps}`);
      existing.totalVolume += exerciseVolume;
      continue;
    }

    groups.set(log.exercise_name, {
      name: log.exercise_name,
      entries: [`${weight}x${sets}x${reps}`],
      totalVolume: exerciseVolume,
    });
  }

  const sections = Array.from(groups.values()).map((group, index) => {
    return [`${index + 1}. ${group.name}:`, ...group.entries, `Total = ${formatNumber(group.totalVolume)}`].join("\n");
  });

  const totalSessionVolume = session.logs.reduce((sum, log) => {
    const [weight = "0", sets = "0", reps = "0"] = log.log_data.replace(/,/g, ".").split("x").map((part) => part.trim());
    return sum + Number(weight) * Number(sets) * Number(reps);
  }, 0);

  return {
    title: `Gym ${session.title} ${formatSessionDate(session.created_at)}`,
    content: `${sections.join("\n\n")}\n\nTotal Sesi:\n${formatNumber(totalSessionVolume)}`,
  };
}

export async function sendSessionToKeep(session: WorkoutSession, collaboratorEmail: string) {
  const payload = {
    ...buildKeepContent(session),
    colaborator_email: collaboratorEmail,
  };

  const response = await fetch(KEEP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send session to Keep");
  }

  return response.json();
}
