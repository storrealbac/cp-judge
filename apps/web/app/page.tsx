"use client";

import { trpc } from "@web/app/trpc";

export default async function Home() {
  const test = await trpc.hello.query({name: "Hola"});
  return <div>{test}</div>;
}
