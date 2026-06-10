import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "./custom.$id";

export const Route = createFileRoute("/custom/new")({
  head: () => ({ meta: [{ title: "New Pack — Caroline" }] }),
  component: () => <Editor id="new" />,
});
