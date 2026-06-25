import { redirect } from "next/navigation";

interface Props {
  searchParams: { [key: string]: string | string[] | undefined } | null;
}

export default function SignInRedirect({ searchParams }: Props) {
  const qs = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) qs.set(key, String(value));
    }
  }
  const query = qs.toString();
  redirect(`/signin${query ? `?${query}` : ""}`);
}
