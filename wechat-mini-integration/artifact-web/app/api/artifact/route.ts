import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  const projectRoot = path.resolve(process.cwd(), "../../.project");

  try {
    // Requirements
    const reqDir = path.join(projectRoot, "requirements");
    let requirements = [];
    try {
      const files = await fs.readdir(reqDir);
      requirements = await Promise.all(
        files
          .filter((f) => f.endsWith(".md"))
          .map(async (file) => {
            const content = await fs.readFile(path.join(reqDir, file), "utf-8");
            return { id: file.replace(".md", ""), content };
          }),
      );
    } catch (e) {
      console.error("Error reading requirements:", e);
    }

    // Tasks
    const tasksFile = path.join(projectRoot, "backlog/tasks.csv");
    let tasks = [];
    try {
      const content = await fs.readFile(tasksFile, "utf-8");
      tasks = content
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.split("|");
          if (parts.length >= 3) {
            return {
              id: parts[0].trim(),
              description: parts[1].trim(),
              status: parts[2].trim(),
            };
          }
          return null;
        })
        .filter((t) => t);
    } catch (e) {
      console.error("Error reading tasks:", e);
    }

    return NextResponse.json({ requirements, tasks });
  } catch (e) {
    console.error("Error in artifact route:", e);
    return NextResponse.json({ requirements: [], tasks: [] });
  }
}
