import { buildTransferRoute } from "@/constants/transfer";
import { Redirect } from "expo-router";

export default function Home() {
  return <Redirect href={buildTransferRoute("send")} />;
}
