import type { Metadata } from "next";
import MeatMountain from "./MeatMountain";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.komran.com"),
  title: "Weekly Meat Mountain | UDLA",
  description:
    "Twelve teams. One summit. Follow the live fantasy football race for glory—and punishment.",
  openGraph: {
    title: "Weekly Meat Mountain",
    description:
      "The UDLA weekly race to the top. Live scores, projections, and punishment odds.",
    images: ["/lab/meat-mountain/mountain.png"],
  },
};
export default function Page() {
  return <MeatMountain />;
}
