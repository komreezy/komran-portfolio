import type { Metadata } from "next";
import Tortalona from "../Tortalona";
export const metadata: Metadata = { title: "Tortalona design preview", robots: { index:false, follow:false } };
export default function Preview() { return <Tortalona previewData={{revision:0,seasons:[{id:"preview",name:"Current season",baselineGame:5,totalGames:9,players:[{id:"alex",name:"Alex",baselineGoals:8},{id:"marco",name:"Marco",baselineGoals:6},{id:"sam",name:"Sam",baselineGoals:5},{id:"leo",name:"Leo",baselineGoals:3},{id:"chris",name:"Chris",baselineGoals:2}],games:[]}]}}/>; }
