import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "مكتبة عالم المستقبل الرقمية | FUTURE WORLD" },
      { name: "description", content: "تم دمج مكتبة الأمن السيبراني مع الأكاديمية لتوفير مسار تعليمي شامل وموحد." },
    ],
  }),
  component: LibraryRedirect,
});

function LibraryRedirect() {
  const { isAr } = useTranslation();
  return (
    <div className="py-12 text-center max-w-lg mx-auto space-y-6">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
        <BookOpen className="h-8 w-8" />
      </div>
      <PageHeader
        title={isAr ? "مكتبة وكتب عالم المستقبل" : "Future World Digital Library"}
        subtitle={
          isAr
            ? "تم دمج مكتبة الكتب والمراجع الرقمية مع الأكاديمية في مسار تعليمي موحد ومحدث."
            : "The digital library has been unified with the Academy for an enriched learning experience."
        }
      />
      <div>
        <Link
          to="/academy"
          className="glow inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-lg"
        >
          <GraduationCap className="h-5 w-5" />
          <span>{isAr ? "الانتقال إلى الأكاديمية والمكتبة" : "Go to Academy & Library"}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
