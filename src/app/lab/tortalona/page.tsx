import type { Metadata } from "next";
import Tortalona from "./Tortalona";
export const metadata: Metadata = { title: "FC Tortalona | The goalscorers", description: "The FC Tortalona scoring table. Every goal, every game, every season." };
export default function Page() { return <Tortalona />; }
