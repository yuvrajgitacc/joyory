import { useMemo } from "react";
import { MessageSquareHeart, HeartHandshake, Eye, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

interface NarratorCardProps {
  narrativeText?: string;
  skinType?: string;
}

interface ParsedSection {
  title: string;
  type: "observations" | "root_cause" | "remedies" | "general";
  paragraphs: string[];
  bulletPoints: Array<{ title: string; desc: string }>;
}

export function NarratorCard({ narrativeText, skinType }: NarratorCardProps) {
  if (!narrativeText) return null;

  // Smart parser to transform raw Gemini text with asterisks into clean, elegant UI blocks
  const parsedSections = useMemo(() => {
    const raw = narrativeText.trim();
    const lines = raw.split("\n");
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection = {
      title: "Consultant Note",
      type: "general",
      paragraphs: [],
      bulletPoints: [],
    };

    const cleanMarkdown = (text: string) => {
      return text.replace(/\*\*/g, "").trim();
    };

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Check if line is a major section heading (e.g. **Kya Dikh Raha Hai...**)
      const lower = line.toLowerCase();
      if (
        (line.startsWith("**") || line.startsWith("##") || line.startsWith("#")) &&
        (lower.includes("kya dikh raha") || lower.includes("scan observation"))
      ) {
        if (currentSection.paragraphs.length > 0 || currentSection.bulletPoints.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          title: "Kya Dikh Raha Hai (Scan Observations)",
          type: "observations",
          paragraphs: [],
          bulletPoints: [],
        };
        continue;
      }

      if (
        (line.startsWith("**") || line.startsWith("##") || line.startsWith("#")) &&
        (lower.includes("kyun hota hai") || lower.includes("root cause"))
      ) {
        if (currentSection.paragraphs.length > 0 || currentSection.bulletPoints.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          title: "Yeh Kyun Hota Hai (Root Cause)",
          type: "root_cause",
          paragraphs: [],
          bulletPoints: [],
        };
        continue;
      }

      if (
        (line.startsWith("**") || line.startsWith("##") || line.startsWith("#")) &&
        (lower.includes("remedies") || lower.includes("kya karna chahiye") || lower.includes("actionable"))
      ) {
        if (currentSection.paragraphs.length > 0 || currentSection.bulletPoints.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          title: "Remedies & Kya Karna Chahiye (Actionable Skincare Solutions)",
          type: "remedies",
          paragraphs: [],
          bulletPoints: [],
        };
        continue;
      }

      // Check if line is a bullet item (e.g. * **Deep Pore Cleansing:** ...)
      if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("• ")) {
        const bulletContent = line.replace(/^[\*\-•]\s*/, "");
        // Extract **Label:** Description if present
        const match = bulletContent.match(/^\*\*(.*?)\*\*:?\s*(.*)$/);
        if (match) {
          currentSection.bulletPoints.push({
            title: match[1].replace(/:$/, "").trim(),
            desc: match[2].replace(/\*\*/g, "").trim(),
          });
        } else {
          currentSection.bulletPoints.push({
            title: "",
            desc: cleanMarkdown(bulletContent),
          });
        }
        continue;
      }

      // Standard paragraph line
      const cleanPara = cleanMarkdown(line);
      if (cleanPara) {
        currentSection.paragraphs.push(cleanPara);
      }
    }

    if (currentSection.paragraphs.length > 0 || currentSection.bulletPoints.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }, [narrativeText]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-rose-200/80 p-6 sm:p-7 shadow-sm transition-all space-y-6">
      {/* Decorative ambient glow */}
      <div className="absolute -top-12 -right-12 size-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 size-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <MessageSquareHeart className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Skin Condition Narrative
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Gemini 2.5 Flash Voice
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Empathetic consultation synthesized from real-time neural telemetry
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/60 text-[11px] text-muted-foreground border border-border self-start sm:self-auto font-medium">
          <HeartHandshake className="size-3.5 text-rose-500" />
          <span>Joyory Personal Beauty Advisor</span>
        </div>
      </div>

      {/* Formatted Sections Grid */}
      <div className="relative z-10 space-y-5">
        {parsedSections.map((sec, idx) => {
          let badgeColor = "bg-primary/10 text-primary border-primary/20";
          let SectionIcon = Eye;

          if (sec.type === "root_cause") {
            badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
            SectionIcon = AlertCircle;
          } else if (sec.type === "remedies") {
            badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
            SectionIcon = Sparkles;
          }

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-muted/20 border border-border/80 space-y-3.5 hover:border-primary/30 transition-colors"
            >
              {/* Section Header */}
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg border ${badgeColor}`}>
                  <SectionIcon className="size-4" />
                </div>
                <h4 className="font-bold text-sm sm:text-base text-foreground">
                  {sec.title}
                </h4>
              </div>

              {/* Paragraphs */}
              {sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {p}
                </p>
              ))}

              {/* Bullet Points with highlight styling */}
              {sec.bulletPoints.length > 0 && (
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {sec.bulletPoints.map((b, bIdx) => (
                    <div
                      key={bIdx}
                      className="p-3 rounded-xl bg-background border border-border flex items-start gap-3 shadow-2xs"
                    >
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm leading-relaxed">
                        {b.title && (
                          <span className="font-bold text-foreground mr-1.5">
                            {b.title}:
                          </span>
                        )}
                        <span className="text-muted-foreground">{b.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Assurance Note */}
      <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
        <span>Gentle cosmetic analysis • Formulated for Indian skin profiles</span>
        <span className="text-[11px] font-mono">100% Non-Judgmental Care</span>
      </div>
    </div>
  );
}
