import dynamic from "next/dynamic";

const NextSpaApp = dynamic(() => import("@/NextSpaApp"), { ssr: false });

export default function CatchAllPage() {
  return <NextSpaApp />;
}
