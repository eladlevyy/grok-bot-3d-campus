import { notFound } from "next/navigation";
import { isAuthed } from "../lib/auth";
import { readData } from "../lib/store";
import ControlCenter from "../components/ControlCenter";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false, nocache: true } };
export default async function Page() {
  if (!(await isAuthed())) notFound();
  return <ControlCenter initial={await readData()} />;
}
