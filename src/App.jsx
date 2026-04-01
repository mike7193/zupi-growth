import { useState, useRef, useCallback, useEffect } from "react";

const T = {
  bg: "#04040A", s: "#0A0A12", s2: "#0F0F18", s3: "#151520",
  b: "#181828", bl: "#242438", t: "#EEEEF4", tm: "#7E7E9E", td: "#484860",
  red: "#FF1A1A", rg: "rgba(255,26,26,0.08)",
  or: "#FF6A2B", og: "rgba(255,106,43,0.08)",
  gr: "#00E88C", gg: "rgba(0,232,140,0.08)",
  yl: "#FFC800", yg: "rgba(255,200,0,0.08)",
  bl2: "#2E8AFF", bg2: "rgba(46,138,255,0.08)",
  pu: "#9B6DFF", pg: "rgba(155,109,255,0.08)",
  cy: "#00D4E8", cg: "rgba(0,212,232,0.08)",
  pk: "#FF5CAD", pkg: "rgba(255,92,173,0.08)"
};

function Card({ children, style, d = 0 }) {
  return (
    <div style={{
      background: T.s, border: `1px solid ${T.b}`, borderRadius: 10, padding: 16,
      animation: "fu .4s ease-out both", animationDelay: `${d}s`, ...style
    }}>{children}</div>
  );
}

function Badge({ children, c = T.red, g }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 7px", borderRadius: 4, fontSize: 9,
      fontWeight: 700, letterSpacing: ".04em", color: c,
      background: g || c + "15", border: `1px solid ${c}20`
    }}>{children}</span>
  );
}

function Mono({ children, style }) {
  return <span style={{ fontFamily: "'JetBrains Mono',monospace", ...style }}>{children}</span>;
}

function Ring({ score, size = 52, stroke = 3, color, label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const col = color || (score >= 70 ? T.gr : score >= 40 ? T.yl : T.red);
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.b} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
          style={{ transition: "stroke-dashoffset .8s ease-out" }} />
      </svg>
      <div style={{ marginTop: -size / 2 - 8, fontSize: size > 50 ? 15 : 12, fontWeight: 700, fontFamily: "'Sora',sans-serif", color: col }}>{score}</div>
      {label && <div style={{ marginTop: size > 50 ? 13 : 9, fontSize: 8, color: T.tm, textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</div>}
    </div>
  );
}

function Loader({ text }) {
  return (
    <div style={{ textAlign: "center", padding: 24, animation: "fi .3s ease-out both" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 7, background: T.s, border: `1px solid ${T.b}` }}>
        <div style={{ width: 12, height: 12, border: `2px solid ${T.red}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin .5s linear infinite" }} />
        <span style={{ fontSize: 11, color: T.tm }}>{text}</span>
      </div>
    </div>
  );
}

async function askClaude(prompt, sys) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 1000,
        system: sys || "YouTube growth expert. Valid JSON only.",
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    const txt = (d.content || []).map(b => b.text || "").join("");
    if (!txt) throw new Error("Empty response");
    return { data: JSON.parse(txt.replace(/```json|```/g, "").trim()), error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

// ── Fallback Data ──
function demoShorts(url) {
  return {
    videoTitle: "Analysis for: " + url,
    clips: [
      { clipNumber: 1, startTime: "0:42", endTime: "1:08", duration: "26s", viralScore: 94, hookLine: "Wait… that's NOT what I expected", whyViral: "Surprise reveal creates instant curiosity. Viewers need to see what happens.", clipType: "Surprise", caption: "Nobody expected this result 😳🔥 #shorts #viral", hashtags: "#shorts #viral #unexpected #reaction", thumbnailConcept: "Freeze frame on shocked face with blurred result behind. Red circle on key element.", textOverlay: "NOBODY EXPECTED THIS", estimatedViews: "50K–150K", postDay: "Day 1" },
      { clipNumber: 2, startTime: "3:15", endTime: "3:48", duration: "33s", viralScore: 89, hookLine: "Here's the trick nobody talks about", whyViral: "Quick actionable value. Viewers save and share tips they can use immediately.", clipType: "Tip", caption: "This trick changes everything 🤯 Save this! #shorts #tips", hashtags: "#shorts #tips #tricks #howto", thumbnailConcept: "Close-up pointing at screen. Bold yellow text: THE TRICK. Clean background.", textOverlay: "THE TRICK NOBODY TELLS YOU", estimatedViews: "30K–100K", postDay: "Day 1" },
      { clipNumber: 3, startTime: "5:02", endTime: "5:35", duration: "33s", viralScore: 85, hookLine: "I compared these side by side and…", whyViral: "Comparison drives debate in comments. Controversy = algorithm boost.", clipType: "Comparison", caption: "The comparison that SHOCKED me 👀 #shorts", hashtags: "#shorts #comparison #versus #review", thumbnailConcept: "Split screen with VS in middle. Surprised expression. Red vs blue scheme.", textOverlay: "WHICH ONE WINS?", estimatedViews: "25K–80K", postDay: "Day 2" },
      { clipNumber: 4, startTime: "1:50", endTime: "2:22", duration: "32s", viralScore: 82, hookLine: "Stop doing this. Seriously.", whyViral: "Contrarian take grabs attention. People click to find out what they're doing wrong.", clipType: "HotTake", caption: "If you're still doing this… STOP 🛑 #shorts", hashtags: "#shorts #advice #mistakes #truth", thumbnailConcept: "Hand up in stop gesture. Bold red STOP text. Dark background.", textOverlay: "STOP DOING THIS", estimatedViews: "20K–70K", postDay: "Day 2" },
      { clipNumber: 5, startTime: "6:30", endTime: "7:00", duration: "30s", viralScore: 78, hookLine: "This is the part that blew my mind", whyViral: "Mind-blown moments create shares. People tag friends in comments.", clipType: "Reaction", caption: "My mind is BLOWN 🤯 Did you know this?? #shorts", hashtags: "#shorts #mindblown #amazing #wow", thumbnailConcept: "Extreme close-up, mouth open. Colorful explosion behind. MIND = BLOWN text.", textOverlay: "MIND = BLOWN", estimatedViews: "15K–50K", postDay: "Day 3" },
      { clipNumber: 6, startTime: "8:10", endTime: "8:42", duration: "32s", viralScore: 74, hookLine: "Here's what I'd actually recommend", whyViral: "Summary clips get saved as reference. High save rate = algorithm boost.", clipType: "Tutorial", caption: "My honest recommendation 💯 #shorts #recommendation", hashtags: "#shorts #recommendation #honest #best", thumbnailConcept: "Thumbs up with product visible. White text: MY #1 PICK. Green checkmark.", textOverlay: "MY #1 PICK", estimatedViews: "15K–40K", postDay: "Day 3" },
    ],
    postingSchedule: {
      day1: { clipNumbers: [1, 2], bestTimes: ["2:00 PM", "6:00 PM"], reason: "Lead with strongest clips. Afternoon + evening catches most viewers." },
      day2: { clipNumbers: [3, 4], bestTimes: ["11:00 AM", "4:00 PM"], reason: "Mid-strength clips keep momentum. Late morning hits different segment." },
      day3: { clipNumbers: [5, 6], bestTimes: ["1:00 PM", "7:00 PM"], reason: "Close with reaction + recommendation. Evening catches weekend planners." }
    },
    editingTips: "CapCut (free): 1) Import → drag to start time → split → end time → split → delete rest. 2) Format → 9:16 → pinch to zoom for vertical. 3) Text → add overlay → Impact font → white + black stroke. ~3 min per clip.",
    overallStrategy: "These 6 Shorts create a flywheel: Clip 1 hooks new viewers → they check your profile → Clip 2 delivers value → subscribe → Clips 3-4 drive debate → Clips 5-6 build authority. Each has a different emotional trigger across 3 days."
  };
}

function demoAudit(url) {
  return {
    videoTitle: "Audit: " + url,
    scores: { overall: 58, ctr: 62, hook: 42, pacing: 71, cta: 38, seo: 65 },
    titleRewrites: ["I Tested This For 30 Days — Here's What Actually Happened", "The Truth About [Topic] Nobody Wants to Admit", "I Was Wrong About [Topic] — Here's the Proof"],
    hookFix: "Your intro spends too long on context. Move the most surprising result to the first 5 seconds, THEN explain. Viewers decide in 8 seconds.",
    thumbnailIdeas: ["Shocked face + bold 2-3 word text + blurred subject behind", "Before vs After split screen with big arrow + reaction in corner", "Dark bg, single bright object, large contrarian text"],
    retentionRisks: [{ time: "0:00–0:15", issue: "Slow intro. Move hook earlier." }, { time: "3:20–4:00", issue: "Tangent. Tighten or cut." }, { time: "7:00–7:30", issue: "Repeated point. Feels like filler." }],
    endScreenStrategy: "Link your highest-retention video, not newest. Verbal CTA at 90%: 'If this helped, you'll love this next one.'",
    ctaFix: "Subscribe CTA too late and generic. Move to 2-min mark after first value moment. Say WHY: 'I test this every week so you don't waste money.'",
    topPriority: "Fix your hook. Your first 15 seconds are losing 40%+ of viewers before they see any value. Move the result/surprise to second 3.",
    freeDistribution: "1) Most relevant subreddit with genuine value post. 2) Niche Discord servers. 3) Twitter/X with a compelling clip as hook."
  };
}

function demoDemand(niche) {
  return { topics: [
    { topic: "The #1 mistake beginners make in " + niche, gapScore: 88, searchVolume: "45K/mo", trend: "↑120%", difficulty: "Easy", format: "Opinion", timing: "NOW", estimatedViews: "30K–100K", whyItWorks: "Beginners always search what to avoid. Low competition.", titleSuggestion: "Stop Making This " + niche + " Mistake" },
    { topic: niche + " in 2026: what changed", gapScore: 82, searchVolume: "38K/mo", trend: "↑200%", difficulty: "Easy", format: "Roundup", timing: "NOW", estimatedViews: "25K–80K", whyItWorks: "Year-specific content gets massive search spikes.", titleSuggestion: niche + " in 2026 — Everything That Changed" },
    { topic: "Best free tools for " + niche, gapScore: 79, searchVolume: "62K/mo", trend: "↑85%", difficulty: "Medium", format: "Listicle", timing: "Evergreen", estimatedViews: "40K–150K", whyItWorks: "'Free tools' = massive volume + high intent. People save & share.", titleSuggestion: "7 Free " + niche + " Tools That Are Actually Good" },
    { topic: "I tried " + niche + " for 30 days", gapScore: 75, searchVolume: "28K/mo", trend: "↑160%", difficulty: "Medium", format: "Challenge", timing: "This week", estimatedViews: "20K–60K", whyItWorks: "Transformation stories = highest retention on YouTube.", titleSuggestion: "I Tried " + niche + " For 30 Days — Results" },
  ]};
}

function demoViral(niche) {
  return { patterns: [
    { pattern: "'I tested X for Y days' challenge", heatScore: 93, rising: true, avgViews: "100K–1M", whyItWorks: "Narrative arc keeps viewers watching. Time constraint adds urgency.", gapOpportunity: "Most " + niche + " creators do reviews, not personal challenges.", actionToday: "Film: 'I tried [" + niche + " thing] for 7 days — what happened'", titleTemplate: "I Tried [THING] For [TIME] — Here's What Happened" },
    { pattern: "Contrarian 'stop doing X' hot take", heatScore: 88, rising: false, avgViews: "80K–500K", whyItWorks: "Curiosity gap — viewers NEED to know what they're doing wrong.", gapOpportunity: niche + " creators play safe. Nobody takes strong stances.", actionToday: "Pick the most common " + niche + " advice you disagree with. Film why it's wrong.", titleTemplate: "Stop [COMMON ADVICE] — Do This Instead" },
    { pattern: "Speed/efficiency content", heatScore: 81, rising: true, avgViews: "60K–400K", whyItWorks: "Fast pace = higher retention. No time to get bored.", gapOpportunity: "Slow tutorials dominate " + niche + ". Nobody makes quick punchy versions.", actionToday: "Take your most complex topic. Explain it in under 3 minutes.", titleTemplate: "[TOPIC] in [SHORT TIME] — Everything You Need" },
  ]};
}

function demoCompetitors(q) {
  return {
    overallStrategy: "Dominate " + q + " by exploiting 3 common gaps: inconsistent uploads, zero Shorts, and weak hooks. Daily posting + Shorts flood = capture the audience competitors leave behind.",
    quickWins: ["Find top 3 " + q + " videos with most views but fewest comments — make response videos", "Search '" + q + "' sorted by 'This month' — any trending topic without a good video is yours", "Check competitors' community tabs — if empty (most are), build engagement they're ignoring"],
    competitors: [
      { name: "Top Creator", estimatedSubs: "500K", estimatedAvgViews: "80K", strengths: ["High production", "Strong thumbnails", "Established trust"], weaknesses: ["Uploads 2x/month only", "Zero Shorts", "30+ sec intros"], audienceStealStrategy: "Cover same topics within 24hr with stronger hooks and shorter runtime. Appear alongside them in suggested.", vulnerabilityScore: 72 },
      { name: "Rising Creator", estimatedSubs: "50K", estimatedAvgViews: "120K", strengths: ["Viral hooks", "Rides trends early", "Good Shorts"], weaknesses: ["No series content", "Clickbait hurts returns", "No community"], audienceStealStrategy: "Build series + community they can't. Your audience returns; theirs doesn't.", vulnerabilityScore: 65 },
    ]
  };
}

// ── Type colors ──
const typeColors = { Reaction: T.or, Tutorial: T.bl2, HotTake: T.red, Surprise: T.yl, Funny: T.pk, Comparison: T.cy, Tip: T.gr };

// ═══════════════════════════════════
// SHORTS CLIPPER
// ═══════════════════════════════════
function ShortsClipper({ onCreateThumb, onSave }) {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [mode, setMode] = useState("url");
  const [ld, setLd] = useState(false);
  const [result, setResult] = useState(null);
  const [demo, setDemo] = useState(false);

  async function analyze() {
    const hasUrl = url.trim().length > 0;
    const hasTranscript = transcript.trim().length > 0;
    if (!hasUrl && !hasTranscript) return;

    setLd(true); setResult(null); setDemo(false);

    let prompt;
    if (hasTranscript) {
      prompt = `Analyze this YouTube video transcript and find the 6 BEST moments to turn into viral Shorts. Use the ACTUAL content from the transcript to identify real moments, real quotes, and real timestamps.

VIDEO URL: "${url || "not provided"}"

FULL TRANSCRIPT:
${transcript.trim().slice(0, 6000)}

IMPORTANT: Base your analysis on the ACTUAL transcript content above. Use real quotes from the transcript as hook lines. Identify real moments that happened. Timestamps should correspond to the approximate position in the transcript.

Return JSON: {"videoTitle":"title based on transcript content","clips":[{"clipNumber":1,"startTime":"M:SS","endTime":"M:SS","duration":"Xs","viralScore":0-100,"hookLine":"actual quote or moment from transcript","whyViral":"why this specific moment works","clipType":"Reaction/Tutorial/HotTake/Surprise/Comparison/Tip","caption":"caption with emojis","hashtags":"#relevant #hashtags","thumbnailConcept":"specific visual for this moment","textOverlay":"bold text overlay","estimatedViews":"range","postDay":"Day 1/2/3"}],"postingSchedule":{"day1":{"clipNumbers":[1,2],"bestTimes":["2:00 PM","6:00 PM"],"reason":"why"},"day2":{"clipNumbers":[3,4],"bestTimes":["11:00 AM","4:00 PM"],"reason":"why"},"day3":{"clipNumbers":[5,6],"bestTimes":["1:00 PM","7:00 PM"],"reason":"why"}},"editingTips":"3 tips specific to this video's content","overallStrategy":"how these 6 Shorts work together based on the actual video content"}`;
    } else {
      prompt = `Analyze this YouTube video for Shorts: "${url}". Find 6 best clips. Return JSON: {"videoTitle":"title","clips":[{"clipNumber":1,"startTime":"M:SS","endTime":"M:SS","duration":"Xs","viralScore":0-100,"hookLine":"opening","whyViral":"why","clipType":"Reaction/Tutorial/HotTake/Surprise/Comparison/Tip","caption":"caption","hashtags":"#tags","thumbnailConcept":"visual","textOverlay":"bold text","estimatedViews":"range","postDay":"Day 1/2/3"}],"postingSchedule":{"day1":{"clipNumbers":[1,2],"bestTimes":["2PM","6PM"],"reason":"why"},"day2":{"clipNumbers":[3,4],"bestTimes":["11AM","4PM"],"reason":"why"},"day3":{"clipNumbers":[5,6],"bestTimes":["1PM","7PM"],"reason":"why"}},"editingTips":"tips","overallStrategy":"strategy"}`;
    }

    const { data, error } = await askClaude(prompt,
      hasTranscript
        ? "You are the world's #1 YouTube Shorts strategist. You are analyzing a REAL transcript. Use ACTUAL quotes and moments from the transcript. Be extremely specific. Valid JSON only."
        : "World's #1 Shorts strategist. Valid JSON only."
    );
    if (data) { setResult(data); if (onSave) onSave(data); } else { setResult(demoShorts(url || "your video")); setDemo(true); if (onSave) onSave(demoShorts(url || "your video")); }
    setLd(false);
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 14px 80px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>✂️</span>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 800 }}>AI Shorts Clipper</h2>
          <Badge c={T.pk} g={T.pkg}>NEW</Badge>
        </div>
        <p style={{ fontSize: 12, color: T.tm }}>Paste a YouTube video → get 6 viral Shorts with timestamps, captions, thumbnails & posting schedule.</p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button onClick={() => setMode("url")} style={{
          padding: "6px 14px", borderRadius: 7, border: `1px solid ${mode === "url" ? T.pk + "44" : T.b}`,
          background: mode === "url" ? T.pkg : "transparent", color: mode === "url" ? T.pk : T.tm,
          fontSize: 12, fontWeight: 500, cursor: "pointer"
        }}>🔗 URL Only (Quick)</button>
        <button onClick={() => setMode("transcript")} style={{
          padding: "6px 14px", borderRadius: 7, border: `1px solid ${mode === "transcript" ? T.gr + "44" : T.b}`,
          background: mode === "transcript" ? T.gg : "transparent", color: mode === "transcript" ? T.gr : T.tm,
          fontSize: 12, fontWeight: 500, cursor: "pointer"
        }}>📝 With Transcript (Accurate)</button>
      </div>

      {mode === "transcript" && (
        <Card d={0.03} style={{ marginBottom: 8, background: T.gg, borderColor: T.gr + "33" }}>
          <Badge c={T.gr} g={T.gg}>RECOMMENDED</Badge>
          <p style={{ marginTop: 4, fontSize: 11, color: T.t, lineHeight: 1.5 }}>
            Paste your transcript for <b>accurate analysis</b> of your actual content. The AI will find real moments, real quotes, and real timestamps from YOUR video.
          </p>
          <p style={{ marginTop: 6, fontSize: 10, color: T.tm, lineHeight: 1.4 }}>
            How to get your transcript: Open your video on YouTube → click "..." below the video → "Show transcript" → Select All → Copy → Paste below.
          </p>
        </Card>
      )}

      <Card d={0.05} style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: mode === "transcript" ? 10 : 0 }}>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=... (optional with transcript)"
            style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 7, border: `1px solid ${T.bl}`, background: T.s2, color: T.t, fontSize: 13 }} />
          <button onClick={analyze} disabled={ld}
            style={{ padding: "10px 18px", borderRadius: 7, border: "none", background: ld ? T.bl : `linear-gradient(135deg,${T.pk},#CC2280)`, color: "#FFF", fontSize: 13, fontWeight: 600, cursor: ld ? "wait" : "pointer", fontFamily: "'Sora',sans-serif" }}>
            {ld ? "Finding clips..." : "Find Shorts"}
          </button>
        </div>

        {mode === "transcript" && (
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder={"Paste your video transcript here...\n\nExample:\n0:00 Hey everyone, welcome back to the channel\n0:05 Today I'm going to show you something that completely changed how I work\n0:12 So I've been testing this new AI tool for the past 30 days..."}
            style={{
              width: "100%", minHeight: 160, padding: "10px 12px", borderRadius: 7,
              border: `1px solid ${T.bl}`, background: T.s2, color: T.t, fontSize: 12,
              lineHeight: 1.5, resize: "vertical", fontFamily: "'DM Sans',sans-serif"
            }}
          />
        )}

        {mode === "transcript" && transcript.trim().length > 0 && (
          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: T.gr }}>
              ✓ {transcript.trim().split(/\s+/).length} words pasted — AI will analyze your actual content
            </span>
            <button onClick={() => setTranscript("")} style={{
              padding: "3px 8px", borderRadius: 4, border: `1px solid ${T.b}`,
              background: "transparent", color: T.td, fontSize: 10, cursor: "pointer"
            }}>Clear</button>
          </div>
        )}
      </Card>

      {ld && <Loader text="AI scanning for viral moments..." />}

      {demo && <Card style={{ background: T.yg, borderColor: T.yl + "33", marginBottom: 8 }}><Badge c={T.yl}>DEMO MODE</Badge><p style={{ marginTop: 4, fontSize: 11, color: T.t }}>Showing sample analysis. Live AI available when deployed with API key.</p></Card>}

      {result && (
        <>
          {result.overallStrategy && (
            <Card d={0.08} style={{ marginBottom: 8, background: `linear-gradient(135deg,${T.pkg},${T.s})`, borderColor: T.pk + "33" }}>
              <Badge c={T.pk}>✂️ STRATEGY</Badge>
              <p style={{ marginTop: 6, fontSize: 12, color: T.t, lineHeight: 1.5 }}>{result.overallStrategy}</p>
            </Card>
          )}

          {result.clips && result.clips.map((clip, i) => (
            <Card key={i} d={0.1 + i * 0.04} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ minWidth: 56 }}>
                  <Ring score={clip.viralScore} size={56} stroke={4} color={T.pk} label="Viral" />
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
                    <Mono style={{ fontSize: 11, fontWeight: 600, color: T.cy, background: T.cg, padding: "2px 7px", borderRadius: 4 }}>
                      {clip.startTime} → {clip.endTime}
                    </Mono>
                    <Badge c={typeColors[clip.clipType] || T.pu} g={(typeColors[clip.clipType] || T.pu) + "12"}>{clip.clipType}</Badge>
                    <Mono style={{ fontSize: 10, color: T.td }}>{clip.duration}</Mono>
                    <Badge c={T.bl2} g={T.bg2}>{clip.postDay}</Badge>
                  </div>

                  <div style={{ padding: "8px 10px", borderRadius: 6, background: T.rg, border: `1px solid ${T.red}15`, marginBottom: 8 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: T.red, textTransform: "uppercase", marginBottom: 3 }}>🎣 Hook</div>
                    <div style={{ fontSize: 13, color: T.t, fontWeight: 600 }}>"{clip.hookLine}"</div>
                  </div>

                  {clip.textOverlay && (
                    <div style={{ padding: "6px 10px", borderRadius: 6, background: T.s3, border: `1px solid ${T.bl}`, marginBottom: 8 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: T.yl, textTransform: "uppercase", marginBottom: 2 }}>📝 Text Overlay</div>
                      <div style={{ fontSize: 14, color: T.t, fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>{clip.textOverlay}</div>
                    </div>
                  )}

                  <p style={{ fontSize: 11, color: T.tm, lineHeight: 1.45, marginBottom: 8 }}>{clip.whyViral}</p>

                  <div style={{ padding: "8px 10px", borderRadius: 6, background: T.pg, border: `1px solid ${T.pu}15`, marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: T.pu, textTransform: "uppercase" }}>🖼️ Thumbnail</div>
                      {onCreateThumb && (
                        <button onClick={() => onCreateThumb(clip.textOverlay, clip.thumbnailConcept)} style={{
                          padding: "4px 10px", borderRadius: 5, border: `1px solid ${T.or}44`,
                          background: T.og, color: T.or, fontSize: 10, fontWeight: 600,
                          cursor: "pointer", fontFamily: "'Sora',sans-serif"
                        }}>🖼️ Create This Thumbnail →</button>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: T.t, lineHeight: 1.4 }}>{clip.thumbnailConcept}</div>
                  </div>

                  <div style={{ padding: "8px 10px", borderRadius: 6, background: T.s2, border: `1px solid ${T.b}`, marginBottom: 6 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: T.gr, textTransform: "uppercase", marginBottom: 3 }}>📋 Caption</div>
                    <div style={{ fontSize: 11, color: T.t, marginBottom: 4 }}>{clip.caption}</div>
                    <div style={{ fontSize: 10, color: T.bl2 }}>{clip.hashtags}</div>
                  </div>

                  <div style={{ fontSize: 10, color: T.td }}>Est: <b style={{ color: T.yl }}>{clip.estimatedViews}</b></div>
                </div>
              </div>
            </Card>
          ))}

          {result.postingSchedule && (
            <Card d={0.35} style={{ marginBottom: 8 }}>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📅 3-Day Posting Schedule</h3>
              {Object.entries(result.postingSchedule).map(([day, info], i) => (
                <div key={day} style={{ padding: "14px 14px", borderRadius: 8, background: i === 0 ? T.rg : i === 1 ? T.og : T.yg, border: `1px solid ${i === 0 ? T.red : i === 1 ? T.or : T.yl}22`, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                    <Badge c={i === 0 ? T.red : i === 1 ? T.or : T.yl}>{day.replace("day", "DAY ")}</Badge>
                    <div style={{ fontSize: 11, color: T.t }}>Post clips: <b>{info.clipNumbers && info.clipNumbers.map(n => "#" + n).join(" & ")}</b></div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    {info.bestTimes && info.bestTimes.map((time, j) => (
                      <div key={j} style={{
                        padding: "10px 18px", borderRadius: 8, background: T.s,
                        border: `1px solid ${T.bl}`, textAlign: "center", minWidth: 100,
                      }}>
                        <div style={{ fontSize: 8, color: T.tm, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
                          {j === 0 ? "🕐 Post 1" : "🕕 Post 2"}
                        </div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: T.gr }}>
                          {time}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: T.tm, lineHeight: 1.4 }}>{info.reason}</div>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: T.s2, border: `1px solid ${T.b}`, fontSize: 10, color: T.tm, lineHeight: 1.4 }}>
                💡 <b style={{ color: T.t }}>Tip:</b> Set phone alarms for these times, or use YouTube Studio's "Schedule" feature to auto-publish at the exact time.
              </div>
            </Card>
          )}

          {result.editingTips && (
            <Card d={0.38} style={{ background: `linear-gradient(135deg,${T.gg},${T.s})`, borderColor: T.gr + "33", marginBottom: 8 }}>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🎬 CapCut Tips (Free)</h3>
              <p style={{ fontSize: 11, color: T.t, lineHeight: 1.55 }}>{result.editingTips}</p>
            </Card>
          )}

          <Card d={0.4} style={{ background: T.s2 }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>⚡ 15-Minute Workflow</h3>
            {["Copy timestamps", "CapCut → import → cut at timestamps", "Format → 9:16 vertical → zoom", "Add text overlays", "Export → Upload to Shorts", "Paste caption + hashtags", "Follow 3-day schedule"].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 8px", borderRadius: 5, background: T.s, border: `1px solid ${T.b}`, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: T.gr, fontWeight: 700 }}>{i + 1}.</span>
                <span style={{ fontSize: 11, color: T.t }}>{step}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: 10, color: T.tm }}>~15 min for all 6 Shorts = 3 days of content from 1 video.</div>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════
// GENERIC AI PAGE
// ═══════════════════════════════════
function AIPage({ title, icon, desc, placeholder, prompt, sys, btnText, quickPicks, fallback, renderResult, onSave }) {
  const [q, setQ] = useState("");
  const [ld, setLd] = useState(false);
  const [r, setR] = useState(null);
  const [demo, setDemo] = useState(false);

  async function go() {
    if (!q.trim()) return;
    setLd(true); setR(null); setDemo(false);
    const { data, error } = await askClaude(prompt(q), sys);
    if (data) { setR(data); if (onSave) onSave(data); } else { const fb = fallback ? fallback(q) : null; setR(fb); setDemo(true); if (onSave && fb) onSave(fb); }
    setLd(false);
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 14px 80px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 800 }}>{title}</h2>
          <Badge c={T.cy} g={T.cg}>AI</Badge>
        </div>
        {desc && <p style={{ fontSize: 12, color: T.tm }}>{desc}</p>}
      </div>
      <Card d={0.05} style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder}
            style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 7, border: `1px solid ${T.bl}`, background: T.s2, color: T.t, fontSize: 13 }} />
          <button onClick={go} disabled={ld}
            style={{ padding: "10px 18px", borderRadius: 7, border: "none", background: ld ? T.bl : `linear-gradient(135deg,${T.red},#990000)`, color: "#FFF", fontSize: 13, fontWeight: 600, cursor: ld ? "wait" : "pointer", fontFamily: "'Sora',sans-serif" }}>
            {ld ? "Working..." : btnText}
          </button>
        </div>
        {quickPicks && (
          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
            {quickPicks.map(n => (
              <button key={n} onClick={() => setQ(n)}
                style={{ padding: "3px 7px", borderRadius: 4, border: `1px solid ${T.b}`, background: "transparent", color: T.tm, fontSize: 10, cursor: "pointer" }}>{n}</button>
            ))}
          </div>
        )}
      </Card>
      {ld && <Loader text="AI working..." />}
      {demo && <Card style={{ background: T.yg, borderColor: T.yl + "33", marginBottom: 8 }}><Badge c={T.yl}>DEMO</Badge><p style={{ marginTop: 4, fontSize: 11, color: T.t }}>Sample data shown. Live AI when deployed.</p></Card>}
      {r && renderResult(r)}
    </div>
  );
}

// ═══════════════════════════════════
// PAGE RENDERERS
// ═══════════════════════════════════
function renderAudit(r) {
  return (
    <>
      {r.topPriority && <Card d={0.07} style={{ marginBottom: 8, background: `linear-gradient(135deg,${T.rg},${T.s})`, borderColor: T.red + "33" }}><Badge c={T.red}>🔥 #1 FIX</Badge><p style={{ marginTop: 6, fontSize: 12, color: T.t, lineHeight: 1.5 }}>{r.topPriority}</p></Card>}
      {r.scores && <Card d={0.09} style={{ textAlign: "center", marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}><Ring score={r.scores.overall} size={64} stroke={4} label="Overall" /><Ring score={r.scores.ctr} size={44} stroke={3} label="CTR" color={T.yl} /><Ring score={r.scores.hook} size={44} stroke={3} label="Hook" color={T.red} /><Ring score={r.scores.pacing} size={44} stroke={3} label="Pacing" color={T.gr} /><Ring score={r.scores.cta} size={44} stroke={3} label="CTA" color={T.pu} /><Ring score={r.scores.seo} size={44} stroke={3} label="SEO" color={T.bl2} /></div></Card>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 8 }}>
        {r.titleRewrites && r.titleRewrites.length > 0 && <Card d={0.11}><h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>✏️ Titles</h3>{r.titleRewrites.map((t, i) => <div key={i} style={{ padding: "6px 8px", borderRadius: 5, background: i === 0 ? T.rg : T.s2, border: `1px solid ${i === 0 ? T.red + "33" : T.b}`, fontSize: 11, color: T.t, marginBottom: 5 }}>{t}</div>)}</Card>}
        {r.hookFix && <Card d={0.13}><h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🎯 Hook</h3><div style={{ padding: 10, borderRadius: 6, background: T.rg, border: `1px solid ${T.red}15`, fontSize: 11, lineHeight: 1.55, color: T.t }}>{r.hookFix}</div></Card>}
        {r.thumbnailIdeas && <Card d={0.15}><h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🖼️ Thumbnails</h3>{r.thumbnailIdeas.map((t, i) => <div key={i} style={{ padding: "5px 8px", borderRadius: 5, background: T.s2, border: `1px solid ${T.b}`, fontSize: 11, color: T.t, marginBottom: 5, lineHeight: 1.4 }}>{t}</div>)}</Card>}
        {r.retentionRisks && <Card d={0.17}><h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📉 Retention</h3>{r.retentionRisks.map((x, i) => <div key={i} style={{ display: "flex", gap: 6, padding: "5px 8px", borderRadius: 5, background: T.s2, border: `1px solid ${T.b}`, marginBottom: 5 }}><Mono style={{ fontSize: 10, color: T.yl, minWidth: 55, fontWeight: 600 }}>{x.time}</Mono><span style={{ fontSize: 10, color: T.tm, lineHeight: 1.35 }}>{x.issue}</span></div>)}</Card>}
        {r.freeDistribution && <Card d={0.19}><h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>🌐 Free Reach</h3><div style={{ padding: 8, borderRadius: 5, background: T.cg, border: `1px solid ${T.cy}15`, fontSize: 11, color: T.t, lineHeight: 1.4 }}>{r.freeDistribution}</div></Card>}
      </div>
    </>
  );
}

function renderDemand(r) {
  if (!r.topics) return null;
  const hc = s => s >= 80 ? T.red : s >= 60 ? T.or : T.yl;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {r.topics.map((t, i) => (
        <Card key={i} d={0.04 + i * 0.03} style={{ padding: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ minWidth: 48, textAlign: "center" }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: hc(t.gapScore) }}>{t.gapScore}</div>
              <div style={{ fontSize: 7, color: T.tm, textTransform: "uppercase" }}>GAP</div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
                <Badge c={t.timing === "NOW" ? T.red : t.timing === "This week" ? T.or : T.td}>{t.timing}</Badge>
                <Badge c={T.cy} g={T.cg}>{t.format}</Badge>
                <Badge c={t.difficulty === "Easy" ? T.gr : t.difficulty === "Medium" ? T.yl : T.red}>{t.difficulty}</Badge>
              </div>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t.topic}</h3>
              {t.titleSuggestion && <div style={{ fontSize: 11, color: T.cy, marginBottom: 3 }}>→ "{t.titleSuggestion}"</div>}
              <p style={{ fontSize: 10, color: T.tm, lineHeight: 1.4, marginBottom: 3 }}>{t.whyItWorks}</p>
              <div style={{ display: "flex", gap: 10, fontSize: 9, color: T.td, flexWrap: "wrap" }}>
                <span>Search: <b style={{ color: T.bl2 }}>{t.searchVolume}</b></span>
                <span>Trend: <b style={{ color: T.gr }}>{t.trend}</b></span>
                <span>Est: <b style={{ color: T.yl }}>{t.estimatedViews}</b></span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function renderViral(r) {
  if (!r.patterns) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {r.patterns.map((p, i) => (
        <Card key={i} d={0.04 + i * 0.04}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
            <Mono style={{ fontSize: 10, fontWeight: 700, color: p.heatScore >= 80 ? T.red : T.or, padding: "2px 6px", borderRadius: 3, background: (p.heatScore >= 80 ? T.red : T.or) + "12" }}>🔥{p.heatScore}</Mono>
            {p.rising && <Badge c={T.gr} g={T.gg}>↑ RISING</Badge>}
            <span style={{ fontSize: 9, color: T.td }}>{p.avgViews}</span>
          </div>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.pattern}</h3>
          <p style={{ fontSize: 11, color: T.tm, lineHeight: 1.4, marginBottom: 6 }}>{p.whyItWorks}</p>
          {p.titleTemplate && <div style={{ padding: "5px 8px", borderRadius: 4, background: T.bg2, border: `1px solid ${T.bl2}15`, fontSize: 10, color: T.bl2, marginBottom: 6 }}>Template: <b>{p.titleTemplate}</b></div>}
          <div style={{ padding: "6px 8px", borderRadius: 5, background: T.rg, border: `1px solid ${T.red}12`, marginBottom: 5 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: T.red, textTransform: "uppercase", marginBottom: 2 }}>Gap</div>
            <div style={{ fontSize: 10, color: T.t, lineHeight: 1.3 }}>{p.gapOpportunity}</div>
          </div>
          <div style={{ padding: "6px 8px", borderRadius: 5, background: T.gg, border: `1px solid ${T.gr}12` }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: T.gr, textTransform: "uppercase", marginBottom: 2 }}>Film Today</div>
            <div style={{ fontSize: 10, color: T.t, lineHeight: 1.3 }}>{p.actionToday}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function renderCompetitors(r) {
  return (
    <>
      {r.overallStrategy && <Card d={0.07} style={{ marginBottom: 8, background: `linear-gradient(135deg,${T.rg},${T.s})`, borderColor: T.red + "33" }}><Badge c={T.red}>⚡ PLAN</Badge><p style={{ marginTop: 6, fontSize: 12, color: T.t, lineHeight: 1.5 }}>{r.overallStrategy}</p></Card>}
      {r.quickWins && <Card d={0.09} style={{ marginBottom: 8 }}><h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>🏃 This Week</h3>{r.quickWins.map((w, i) => <div key={i} style={{ padding: "5px 8px", borderRadius: 5, background: T.gg, border: `1px solid ${T.gr}15`, fontSize: 11, color: T.t, marginBottom: 4, lineHeight: 1.4 }}><b style={{ color: T.gr }}>{i + 1}.</b> {w}</div>)}</Card>}
      {r.competitors && r.competitors.map((c, i) => (
        <Card key={i} d={0.11 + i * 0.04} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
            <div>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700 }}>{c.name}</h3>
              <div style={{ fontSize: 9, color: T.td }}>{c.estimatedSubs} · {c.estimatedAvgViews}</div>
            </div>
            <div style={{ padding: "3px 8px", borderRadius: 4, background: c.vulnerabilityScore >= 70 ? T.gg : T.yg }}>
              <span style={{ fontSize: 9, color: T.tm }}>Vuln </span>
              <Mono style={{ fontSize: 12, fontWeight: 700, color: c.vulnerabilityScore >= 70 ? T.gr : T.yl }}>{c.vulnerabilityScore}</Mono>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
            <div>{c.strengths && c.strengths.map((s, j) => <div key={j} style={{ fontSize: 10, color: T.tm, padding: "2px 0", display: "flex", gap: 4, lineHeight: 1.3 }}><span style={{ color: T.gr }}>+</span>{s}</div>)}</div>
            <div>{c.weaknesses && c.weaknesses.map((w, j) => <div key={j} style={{ fontSize: 10, color: T.tm, padding: "2px 0", display: "flex", gap: 4, lineHeight: 1.3 }}><span style={{ color: T.red }}>−</span>{w}</div>)}</div>
          </div>
          <div style={{ padding: "7px 10px", borderRadius: 5, background: `linear-gradient(135deg,${T.rg},${T.gg})` }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: T.or, textTransform: "uppercase", marginBottom: 2 }}>⚡ STEAL</div>
            <div style={{ fontSize: 11, color: T.t, lineHeight: 1.4 }}>{c.audienceStealStrategy}</div>
          </div>
        </Card>
      ))}
    </>
  );
}

// ═══════════════════════════════════
// THUMBNAIL MAKER
// ═══════════════════════════════════
function ThumbnailMaker({ preset, onPresetUsed }) {
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [text, setText] = useState("MIND = BLOWN");
  const [subText, setSubText] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [textSize, setTextSize] = useState(72);
  const [textPos, setTextPos] = useState("center");
  const [overlay, setOverlay] = useState("none");
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [badge, setBadge] = useState("");
  const [badgeColor, setBadgeColor] = useState("#FF1A1A");
  const [rendered, setRendered] = useState(false);
  const [presetApplied, setPresetApplied] = useState(false);

  // Apply preset from Shorts Clipper
  useEffect(() => {
    if (preset && !presetApplied) {
      if (preset.text) setText(preset.text);
      if (preset.concept) setSubText("");
      setOverlay("gradient-bottom");
      setTextSize(76);
      setTextColor("#FFFFFF");
      setStrokeColor("#000000");
      setBrightness(110);
      setPresetApplied(true);
      if (onPresetUsed) onPresetUsed();
    }
  }, [preset, presetApplied, onPresetUsed]);

  const W = 1280;
  const H = 720;

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const image = new Image();
      image.onload = () => { setImg(image); setImgSrc(ev.target.result); };
      image.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, W, H);

    // Image
    if (img) {
      ctx.save();
      ctx.filter = `brightness(${brightness}%)`;
      const scale = (zoom / 100);
      const dw = W * scale;
      const dh = (img.height / img.width) * dw;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    }

    // Overlay
    if (overlay === "dark") {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, W, H);
    } else if (overlay === "gradient-bottom") {
      const grad = ctx.createLinearGradient(0, H * 0.4, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (overlay === "gradient-top") {
      const grad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      grad.addColorStop(0, "rgba(0,0,0,0.85)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (overlay === "vignette") {
      const grad = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*0.7);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (overlay === "red-tint") {
      ctx.fillStyle = "rgba(255,20,20,0.15)";
      ctx.fillRect(0, 0, W, H);
    } else if (overlay === "blue-tint") {
      ctx.fillStyle = "rgba(20,60,255,0.15)";
      ctx.fillRect(0, 0, W, H);
    }

    // Main text
    if (text.trim()) {
      const fontSize = textSize;
      ctx.font = `900 ${fontSize}px 'Arial Black', 'Impact', sans-serif`;
      ctx.textAlign = textPos === "left" ? "left" : textPos === "right" ? "right" : "center";
      ctx.textBaseline = "middle";

      let tx = textPos === "left" ? 60 : textPos === "right" ? W - 60 : W / 2;
      let ty = subText ? H / 2 - 30 : H / 2;

      // Stroke
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(8, fontSize / 6);
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;

      // Word wrap
      const words = text.split(" ");
      const maxW = W - 120;
      let lines = [];
      let line = "";
      words.forEach(w => {
        const test = line + (line ? " " : "") + w;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);

      const lineH = fontSize * 1.15;
      const startY = ty - ((lines.length - 1) * lineH) / 2;

      lines.forEach((l, i) => {
        const ly = startY + i * lineH;
        ctx.strokeText(l, tx, ly);
        ctx.fillStyle = textColor;
        ctx.fillText(l, tx, ly);
      });

      // Sub text
      if (subText.trim()) {
        const subSize = Math.round(fontSize * 0.4);
        ctx.font = `700 ${subSize}px 'Arial', sans-serif`;
        const subY = startY + lines.length * lineH + 10;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 4;
        ctx.strokeText(subText, tx, subY);
        ctx.fillStyle = textColor;
        ctx.fillText(subText, tx, subY);
      }
    }

    // Badge
    if (badge.trim()) {
      ctx.font = "bold 28px 'Arial', sans-serif";
      const bw = ctx.measureText(badge).width + 30;
      ctx.fillStyle = badgeColor;
      const rx = W - bw - 30;
      ctx.beginPath();
      ctx.roundRect(rx, 28, bw, 44, 8);
      ctx.fill();
      ctx.fillStyle = "#FFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(badge, rx + bw / 2, 50);
    }

    setRendered(true);
  }, [img, text, subText, textColor, strokeColor, textSize, textPos, overlay, brightness, zoom, badge, badgeColor]);

  useEffect(() => { draw(); }, [draw]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "thumbnail.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const presets = [
    { name: "🔥 Bold Red", text: "NOBODY EXPECTED THIS", textColor: "#FFFFFF", strokeColor: "#CC0000", overlay: "dark", textSize: 76 },
    { name: "⚡ Yellow Pop", text: "MIND = BLOWN", textColor: "#FFD700", strokeColor: "#000000", overlay: "vignette", textSize: 80 },
    { name: "❄️ Clean White", text: "THE TRUTH", textColor: "#FFFFFF", strokeColor: "#000000", overlay: "gradient-bottom", textSize: 84 },
    { name: "🔴 Red Alert", text: "STOP DOING THIS", textColor: "#FFFFFF", strokeColor: "#FF0000", overlay: "red-tint", textSize: 72 },
  ];

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 14px 80px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>🖼️</span>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 800 }}>Thumbnail Maker</h2>
          <Badge c={T.or} g={T.og}>NEW</Badge>
        </div>
        <p style={{ fontSize: 12, color: T.tm }}>Upload a screenshot from your video → add bold text & effects → download a ready-to-use thumbnail.</p>
      </div>

      {/* Preset banner from Shorts Clipper */}
      {preset && preset.concept && (
        <Card d={0.03} style={{ marginBottom: 10, background: T.og, borderColor: T.or + "33" }}>
          <Badge c={T.or} g={T.og}>FROM SHORTS CLIPPER</Badge>
          <p style={{ marginTop: 6, fontSize: 12, color: T.t, lineHeight: 1.5 }}>
            <b>Text:</b> {preset.text || "—"}
          </p>
          <p style={{ marginTop: 4, fontSize: 11, color: T.tm, lineHeight: 1.4 }}>
            <b>Concept:</b> {preset.concept}
          </p>
          <p style={{ marginTop: 6, fontSize: 10, color: T.or }}>
            ↑ Upload your screenshot below, and the text is already set. Just adjust styling and download!
          </p>
        </Card>
      )}

      {/* Upload */}
      {!img ? (
        <Card d={0.05} style={{ marginBottom: 12 }}>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "40px 20px", borderRadius: 10, border: `2px dashed ${T.bl}`,
            background: T.s2, cursor: "pointer", textAlign: "center",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.pk; e.currentTarget.style.background = T.pkg; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.bl; e.currentTarget.style.background = T.s2; }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: T.t, marginBottom: 6 }}>
              Tap here to upload your screenshot
            </div>
            <div style={{ fontSize: 12, color: T.tm, marginBottom: 4 }}>
              Take a screenshot from your video, then select it here
            </div>
            <div style={{ fontSize: 11, color: T.td }}>
              Works with any image from your phone or computer
            </div>
            <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
          </label>
        </Card>
      ) : (
        <Card d={0.05} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: T.gr }}>✓ Screenshot loaded ({img.width}×{img.height})</span>
            <label style={{
              padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.b}`,
              background: T.s2, color: T.tm, fontSize: 11, cursor: "pointer",
            }}>
              📸 Change image
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
            </label>
          </div>
        </Card>
      )}

      {/* Canvas preview */}
      <Card d={0.08} style={{ marginBottom: 12, padding: 12 }}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", background: "#111", borderRadius: 8, overflow: "hidden" }}>
          <canvas ref={canvasRef} width={W} height={H}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 8 }} />
        </div>
        {rendered && (
          <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={download} style={{
              padding: "10px 24px", borderRadius: 7, border: "none",
              background: `linear-gradient(135deg,${T.gr},#00AA66)`,
              color: "#FFF", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif"
            }}>⬇️ Download Thumbnail (1280x720)</button>
          </div>
        )}
      </Card>

      {/* Presets */}
      <Card d={0.1} style={{ marginBottom: 12 }}>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>⚡ Quick Presets</h3>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {presets.map((p, i) => (
            <button key={i} onClick={() => { setText(p.text); setTextColor(p.textColor); setStrokeColor(p.strokeColor); setOverlay(p.overlay); setTextSize(p.textSize); }}
              style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.b}`, background: T.s2, color: T.t, fontSize: 11, cursor: "pointer" }}>
              {p.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
        <Card d={0.12}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>📝 Text</h3>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Main text..."
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.bl}`, background: T.s2, color: T.t, fontSize: 13, marginBottom: 8, fontWeight: 700 }} />
          <input value={subText} onChange={e => setSubText(e.target.value)} placeholder="Sub text (optional)..."
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.bl}`, background: T.s2, color: T.t, fontSize: 12, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: T.tm, minWidth: 60 }}>Size: {textSize}</span>
            <input type="range" min={30} max={120} value={textSize} onChange={e => setTextSize(+e.target.value)}
              style={{ flex: 1, accentColor: T.pk }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["left", "center", "right"].map(p => (
              <button key={p} onClick={() => setTextPos(p)} style={{
                padding: "4px 10px", borderRadius: 5, border: `1px solid ${textPos === p ? T.pk + "44" : T.b}`,
                background: textPos === p ? T.pkg : "transparent", color: textPos === p ? T.pk : T.tm,
                fontSize: 11, cursor: "pointer", textTransform: "capitalize"
              }}>{p}</button>
            ))}
          </div>
        </Card>

        <Card d={0.14}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>🎨 Colors & Effects</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.tm }}>
              Text <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: 28, height: 28, border: "none", cursor: "pointer", borderRadius: 4 }} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.tm }}>
              Stroke <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} style={{ width: 28, height: 28, border: "none", cursor: "pointer", borderRadius: 4 }} />
            </label>
          </div>
          <div style={{ fontSize: 10, color: T.tm, marginBottom: 6 }}>Overlay:</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {[["none","None"],["dark","Dark"],["gradient-bottom","Grad ↓"],["gradient-top","Grad ↑"],["vignette","Vignette"],["red-tint","Red"],["blue-tint","Blue"]].map(([k,l]) => (
              <button key={k} onClick={() => setOverlay(k)} style={{
                padding: "3px 8px", borderRadius: 4, border: `1px solid ${overlay === k ? T.or + "44" : T.b}`,
                background: overlay === k ? T.og : "transparent", color: overlay === k ? T.or : T.tm,
                fontSize: 10, cursor: "pointer"
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: T.tm, minWidth: 70 }}>Bright: {brightness}%</span>
            <input type="range" min={30} max={150} value={brightness} onChange={e => setBrightness(+e.target.value)} style={{ flex: 1, accentColor: T.yl }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: T.tm, minWidth: 70 }}>Zoom: {zoom}%</span>
            <input type="range" min={80} max={200} value={zoom} onChange={e => setZoom(+e.target.value)} style={{ flex: 1, accentColor: T.cy }} />
          </div>
        </Card>

        <Card d={0.16}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>🏷️ Badge (optional)</h3>
          <input value={badge} onChange={e => setBadge(e.target.value)} placeholder="e.g. NEW, #1 PICK, FREE..."
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.bl}`, background: T.s2, color: T.t, fontSize: 12, marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["#FF1A1A","Red"],["#FF6A2B","Orange"],["#00E88C","Green"],["#2E8AFF","Blue"],["#FFD700","Gold"]].map(([c,l]) => (
              <button key={c} onClick={() => setBadgeColor(c)} style={{
                padding: "4px 10px", borderRadius: 5, border: `1px solid ${badgeColor === c ? c + "66" : T.b}`,
                background: badgeColor === c ? c + "22" : "transparent", color: c,
                fontSize: 10, fontWeight: 700, cursor: "pointer"
              }}>{l}</button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// VIDEO AUDIT WITH TRANSCRIPT
// ═══════════════════════════════════
function VideoAuditPage({ onSave }) {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [mode, setMode] = useState("url");
  const [ld, setLd] = useState(false);
  const [r, setR] = useState(null);
  const [demo, setDemo] = useState(false);

  async function go() {
    if (!url.trim() && !transcript.trim()) return;
    setLd(true); setR(null); setDemo(false);
    const hasT = transcript.trim().length > 0;
    const prompt = hasT
      ? `Analyze this YouTube video using the ACTUAL transcript. Give specific, accurate advice based on the real content.

URL: "${url || "not provided"}"

TRANSCRIPT:
${transcript.trim().slice(0, 6000)}

Return JSON: {"videoTitle":"actual title from content","scores":{"overall":0-100,"ctr":0-100,"hook":0-100,"pacing":0-100,"cta":0-100,"seo":0-100},"titleRewrites":["3 titles based on actual content"],"hookFix":"specific fix for the actual intro","thumbnailIdeas":["3 ideas based on actual content"],"retentionRisks":[{"time":"X:XX-X:XX","issue":"specific issue from transcript"}],"endScreenStrategy":"specific rec","ctaFix":"specific fix","topPriority":"#1 change based on actual content","freeDistribution":"3 places to share based on the topic"}`
      : `Analyze "${url}" for organic growth. Return JSON: {"videoTitle":"title","scores":{"overall":0-100,"ctr":0-100,"hook":0-100,"pacing":0-100,"cta":0-100,"seo":0-100},"titleRewrites":["t1","t2","t3"],"hookFix":"fix","thumbnailIdeas":["i1","i2","i3"],"retentionRisks":[{"time":"X:XX","issue":"desc"}],"endScreenStrategy":"rec","ctaFix":"fix","topPriority":"#1 change","freeDistribution":"3 places"}`;

    const { data } = await askClaude(prompt, hasT ? "Aggressive YouTube strategist analyzing REAL transcript. Be extremely specific. Valid JSON only." : "Aggressive YouTube organic strategist. Valid JSON only.");
    if (data) { setR(data); if (onSave) onSave(data); } else { setR(demoAudit(url || "your video")); setDemo(true); if (onSave) onSave(demoAudit(url || "your video")); }
    setLd(false);
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 14px 80px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>🔍</span>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 800 }}>AI Video Audit</h2>
          <Badge c={T.cy} g={T.cg}>AI</Badge>
        </div>
        <p style={{ fontSize: 12, color: T.tm }}>Full growth breakdown. Add your transcript for accurate, specific advice.</p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button onClick={() => setMode("url")} style={{
          padding: "6px 14px", borderRadius: 7, border: `1px solid ${mode === "url" ? T.red + "44" : T.b}`,
          background: mode === "url" ? T.rg : "transparent", color: mode === "url" ? T.red : T.tm,
          fontSize: 12, fontWeight: 500, cursor: "pointer"
        }}>🔗 URL Only</button>
        <button onClick={() => setMode("transcript")} style={{
          padding: "6px 14px", borderRadius: 7, border: `1px solid ${mode === "transcript" ? T.gr + "44" : T.b}`,
          background: mode === "transcript" ? T.gg : "transparent", color: mode === "transcript" ? T.gr : T.tm,
          fontSize: 12, fontWeight: 500, cursor: "pointer"
        }}>📝 With Transcript</button>
      </div>

      <Card d={0.05} style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: mode === "transcript" ? 10 : 0 }}>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
            style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 7, border: `1px solid ${T.bl}`, background: T.s2, color: T.t, fontSize: 13 }} />
          <button onClick={go} disabled={ld}
            style={{ padding: "10px 18px", borderRadius: 7, border: "none", background: ld ? T.bl : `linear-gradient(135deg,${T.red},#990000)`, color: "#FFF", fontSize: 13, fontWeight: 600, cursor: ld ? "wait" : "pointer", fontFamily: "'Sora',sans-serif" }}>
            {ld ? "Analyzing..." : "Audit"}
          </button>
        </div>
        {mode === "transcript" && (
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
            placeholder="Paste your video transcript here..."
            style={{ width: "100%", minHeight: 120, padding: "10px 12px", borderRadius: 7, border: `1px solid ${T.bl}`, background: T.s2, color: T.t, fontSize: 12, lineHeight: 1.5, resize: "vertical", fontFamily: "'DM Sans',sans-serif" }} />
        )}
        {mode === "transcript" && transcript.trim().length > 0 && (
          <div style={{ marginTop: 6, fontSize: 10, color: T.gr }}>✓ {transcript.trim().split(/\s+/).length} words — AI will analyze your actual content</div>
        )}
      </Card>
      {ld && <Loader text="Analyzing..." />}
      {demo && <Card style={{ background: T.yg, borderColor: T.yl + "33", marginBottom: 8 }}><Badge c={T.yl}>DEMO</Badge><p style={{ marginTop: 4, fontSize: 11, color: T.t }}>Sample data shown. Live AI when deployed.</p></Card>}
      {r && renderAudit(r)}
    </div>
  );
}

// ═══════════════════════════════════
// CAMPAIGN STORAGE
// ═══════════════════════════════════
function saveCampaign(type, data) {
  try {
    const campaigns = JSON.parse(localStorage.getItem("zupi_campaigns") || "[]");
    const campaign = {
      id: Date.now().toString(),
      type,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      data
    };
    campaigns.unshift(campaign);
    if (campaigns.length > 50) campaigns.length = 50;
    localStorage.setItem("zupi_campaigns", JSON.stringify(campaigns));
    return campaign.id;
  } catch (e) { console.error("Save error:", e); return null; }
}

function getCampaigns() {
  try { return JSON.parse(localStorage.getItem("zupi_campaigns") || "[]"); }
  catch { return []; }
}

function deleteCampaign(id) {
  try {
    const campaigns = getCampaigns().filter(c => c.id !== id);
    localStorage.setItem("zupi_campaigns", JSON.stringify(campaigns));
  } catch (e) { console.error(e); }
}

const typeIcons = { shorts: "✂️", audit: "🔍", demand: "📡", viral: "🧬", compete: "🎯" };
const typeLabels = { shorts: "Shorts Clipper", audit: "Video Audit", demand: "Demand Scan", viral: "Viral Patterns", compete: "Competitor Analysis" };
const typeColors2 = { shorts: T.pk, audit: T.bl2, demand: T.cy, viral: T.pu, compete: T.red };

// ═══════════════════════════════════
// CAMPAIGNS PAGE
// ═══════════════════════════════════
function CampaignsPage({ onView }) {
  const [campaigns, setCampaigns] = useState(getCampaigns());
  const [filter, setFilter] = useState("all");
  const [confirm, setConfirm] = useState(null);

  function handleDelete(id) {
    deleteCampaign(id);
    setCampaigns(getCampaigns());
    setConfirm(null);
  }

  function handleClearAll() {
    localStorage.removeItem("zupi_campaigns");
    setCampaigns([]);
    setConfirm(null);
  }

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.type === filter);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 14px 80px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>📂</span>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 800 }}>My Campaigns</h2>
          <Badge c={T.gr} g={T.gg}>{campaigns.length} SAVED</Badge>
        </div>
        <p style={{ fontSize: 12, color: T.tm }}>All your past analyses saved automatically. Click any campaign to view the full results.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        {[["all", "All"], ["shorts", "✂️ Shorts"], ["audit", "🔍 Audits"], ["demand", "📡 Demand"], ["viral", "🧬 Patterns"], ["compete", "🎯 Compete"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: "5px 12px", borderRadius: 6, border: `1px solid ${filter === k ? T.red + "44" : T.b}`,
            background: filter === k ? T.rg : "transparent", color: filter === k ? T.red : T.tm,
            fontSize: 11, fontWeight: 500, cursor: "pointer"
          }}>{l}</button>
        ))}
        {campaigns.length > 0 && (
          <button onClick={() => setConfirm("all")} style={{
            marginLeft: "auto", padding: "5px 12px", borderRadius: 6, border: `1px solid ${T.b}`,
            background: "transparent", color: T.td, fontSize: 10, cursor: "pointer"
          }}>🗑️ Clear all</button>
        )}
      </div>

      {/* Confirm clear all */}
      {confirm === "all" && (
        <Card style={{ background: T.rg, borderColor: T.red + "33", marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: T.t, marginBottom: 8 }}>Delete all campaigns? This can't be undone.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleClearAll} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: T.red, color: "#FFF", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Yes, delete all</button>
            <button onClick={() => setConfirm(null)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.b}`, background: "transparent", color: T.tm, fontSize: 11, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <Card style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
            {campaigns.length === 0 ? "No campaigns yet" : "No " + (typeLabels[filter] || "") + " campaigns"}
          </h3>
          <p style={{ fontSize: 12, color: T.tm }}>
            {campaigns.length === 0 ? "Run your first analysis in any tab — it'll be saved here automatically." : "Try a different filter or run a new analysis."}
          </p>
        </Card>
      )}

      {/* Campaign list */}
      {filtered.map((c, i) => (
        <Card key={c.id} d={0.03 + i * 0.02} style={{ marginBottom: 8, cursor: "pointer" }}
          onClick={() => onView && onView(c)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16 }}>{typeIcons[c.type] || "📄"}</span>
                <Badge c={typeColors2[c.type] || T.bl2} g={(typeColors2[c.type] || T.bl2) + "15"}>{typeLabels[c.type] || c.type}</Badge>
                <span style={{ fontSize: 10, color: T.td }}>{c.date}</span>
              </div>
              <div style={{ fontSize: 13, color: T.t, fontWeight: 600, marginBottom: 4 }}>
                {c.data?.videoTitle || c.data?.overallStrategy?.slice(0, 80) || c.data?.topics?.[0]?.topic || c.data?.patterns?.[0]?.pattern || "Campaign"}
              </div>
              {c.type === "shorts" && c.data?.clips && (
                <div style={{ fontSize: 10, color: T.tm }}>{c.data.clips.length} clips found · Best: {c.data.clips[0]?.viralScore || "—"} viral score</div>
              )}
              {c.type === "audit" && c.data?.scores && (
                <div style={{ fontSize: 10, color: T.tm }}>Overall score: {c.data.scores.overall}/100 · CTR: {c.data.scores.ctr} · Hook: {c.data.scores.hook}</div>
              )}
              {c.type === "demand" && c.data?.topics && (
                <div style={{ fontSize: 10, color: T.tm }}>{c.data.topics.length} topics found · Top gap: {c.data.topics[0]?.gapScore || "—"}</div>
              )}
              {c.type === "viral" && c.data?.patterns && (
                <div style={{ fontSize: 10, color: T.tm }}>{c.data.patterns.length} patterns · Top: {c.data.patterns[0]?.heatScore || "—"} heat</div>
              )}
              {c.type === "compete" && c.data?.competitors && (
                <div style={{ fontSize: 10, color: T.tm }}>{c.data.competitors.length} competitors analyzed</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: T.gr }}>View →</span>
              <button onClick={(e) => { e.stopPropagation(); setConfirm(c.id); }} style={{
                padding: "3px 6px", borderRadius: 4, border: `1px solid ${T.b}`,
                background: "transparent", color: T.td, fontSize: 10, cursor: "pointer"
              }}>🗑️</button>
            </div>
          </div>
          {confirm === c.id && (
            <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }} onClick={e => e.stopPropagation()}>
              <span style={{ fontSize: 11, color: T.red }}>Delete this campaign?</span>
              <button onClick={() => handleDelete(c.id)} style={{ padding: "4px 10px", borderRadius: 5, border: "none", background: T.red, color: "#FFF", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Delete</button>
              <button onClick={() => setConfirm(null)} style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${T.b}`, background: "transparent", color: T.tm, fontSize: 10, cursor: "pointer" }}>Cancel</button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════
// CAMPAIGN DETAIL VIEW
// ═══════════════════════════════════
function CampaignDetail({ campaign, onBack }) {
  if (!campaign) return null;
  const c = campaign;
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 14px 80px" }}>
      <button onClick={onBack} style={{
        padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.b}`,
        background: T.s2, color: T.tm, fontSize: 12, cursor: "pointer", marginBottom: 14,
        display: "flex", alignItems: "center", gap: 6
      }}>← Back to Campaigns</button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 22 }}>{typeIcons[c.type] || "📄"}</span>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800 }}>{typeLabels[c.type] || c.type}</h2>
        <Badge c={typeColors2[c.type] || T.bl2}>{c.date}</Badge>
      </div>

      {c.type === "shorts" && c.data && renderShortsResult(c.data)}
      {c.type === "audit" && c.data && renderAudit(c.data)}
      {c.type === "demand" && c.data && renderDemand(c.data)}
      {c.type === "viral" && c.data && renderViral(c.data)}
      {c.type === "compete" && c.data && renderCompetitors(c.data)}
    </div>
  );
}

// ── Shorts result renderer (extracted for reuse) ──
function renderShortsResult(result) {
  return (
    <>
      {result.overallStrategy && (
        <Card d={0.05} style={{ marginBottom: 8, background: `linear-gradient(135deg,${T.pkg},${T.s})`, borderColor: T.pk + "33" }}>
          <Badge c={T.pk}>✂️ STRATEGY</Badge>
          <p style={{ marginTop: 6, fontSize: 12, color: T.t, lineHeight: 1.5 }}>{result.overallStrategy}</p>
        </Card>
      )}
      {result.clips && result.clips.map((clip, i) => (
        <Card key={i} d={0.07 + i * 0.03} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ minWidth: 56 }}><Ring score={clip.viralScore} size={56} stroke={4} color={T.pk} label="Viral" /></div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
                <Mono style={{ fontSize: 11, fontWeight: 600, color: T.cy, background: T.cg, padding: "2px 7px", borderRadius: 4 }}>{clip.startTime} → {clip.endTime}</Mono>
                <Badge c={typeColors[clip.clipType] || T.pu} g={(typeColors[clip.clipType] || T.pu) + "12"}>{clip.clipType}</Badge>
                <Mono style={{ fontSize: 10, color: T.td }}>{clip.duration}</Mono>
                <Badge c={T.bl2} g={T.bg2}>{clip.postDay}</Badge>
              </div>
              <div style={{ padding: "8px 10px", borderRadius: 6, background: T.rg, border: `1px solid ${T.red}15`, marginBottom: 8 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: T.red, textTransform: "uppercase", marginBottom: 3 }}>🎣 Hook</div>
                <div style={{ fontSize: 13, color: T.t, fontWeight: 600 }}>"{clip.hookLine}"</div>
              </div>
              {clip.textOverlay && <div style={{ padding: "6px 10px", borderRadius: 6, background: T.s3, border: `1px solid ${T.bl}`, marginBottom: 8 }}><div style={{ fontSize: 8, fontWeight: 700, color: T.yl, textTransform: "uppercase", marginBottom: 2 }}>📝 Text Overlay</div><div style={{ fontSize: 14, color: T.t, fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>{clip.textOverlay}</div></div>}
              <p style={{ fontSize: 11, color: T.tm, lineHeight: 1.45, marginBottom: 8 }}>{clip.whyViral}</p>
              <div style={{ padding: "8px 10px", borderRadius: 6, background: T.s2, border: `1px solid ${T.b}`, marginBottom: 6 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: T.gr, textTransform: "uppercase", marginBottom: 3 }}>📋 Caption</div>
                <div style={{ fontSize: 11, color: T.t, marginBottom: 4 }}>{clip.caption}</div>
                <div style={{ fontSize: 10, color: T.bl2 }}>{clip.hashtags}</div>
              </div>
              <div style={{ fontSize: 10, color: T.td }}>Est: <b style={{ color: T.yl }}>{clip.estimatedViews}</b></div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

// ═══════════════════════════════════
// MY PLAN — 7-DAY GOAL TRACKER
// ═══════════════════════════════════
function MyPlan() {
  const STORAGE_KEY = "zupi_plan_checks";
  const [checks, setChecks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
  });

  function toggle(id) {
    const next = { ...checks, [id]: !checks[id] };
    setChecks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const totalTasks = 24;
  const doneCount = Object.values(checks).filter(Boolean).length;
  const pct = Math.round((doneCount / totalTasks) * 100);

  function Task({ id, time, text, tag }) {
    const done = checks[id];
    const tagCol = { clip: T.pk, post: T.bl2, engage: T.gr, analyze: T.or, plan: T.pu };
    return (
      <div onClick={() => toggle(id)} style={{
        display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px",
        borderRadius: 6, background: done ? T.gg : T.s2, border: `1px solid ${done ? T.gr + "22" : T.b}`,
        cursor: "pointer", opacity: done ? 0.6 : 1, transition: "all 0.2s"
      }}>
        <div style={{
          minWidth: 18, height: 18, borderRadius: 4, marginTop: 1,
          border: `2px solid ${done ? T.gr : T.bl}`, background: done ? T.gr : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, color: "#000", fontWeight: 800
        }}>{done ? "✓" : ""}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: T.t, lineHeight: 1.4, textDecoration: done ? "line-through" : "none" }}>{text}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
            {time && <Mono style={{ fontSize: 10, color: T.cy }}>{time}</Mono>}
            {tag && <Badge c={tagCol[tag] || T.td} g={(tagCol[tag] || T.td) + "15"}>{tag}</Badge>}
          </div>
        </div>
      </div>
    );
  }

  const days = [
    { day: "Day 1", label: "TODAY", color: T.red, tasks: [
      { id: "d1t1", time: "2:00 PM", text: "Cut Clip 1 (0:17–0:41): 'Wallet empty, phone on 1%' → CapCut → 9:16 vertical → add 'PHONE ON 1% 💀' text overlay", tag: "clip" },
      { id: "d1t2", time: "2:00 PM", text: "Upload Clip 1 as YouTube Short. Caption: 'When life hits different in Japan 😭🔥 #shorts #japanhiphop #hashire'", tag: "post" },
      { id: "d1t3", time: "6:00 PM", text: "Cut Clip 2 (0:26–0:41): 'She said who that girl? Just my wifi' → add 'JUST MY WIFI 😂' text", tag: "clip" },
      { id: "d1t4", time: "6:00 PM", text: "Upload Clip 2 as YouTube Short. Caption: 'She wasn't ready for this answer 💀😂 #shorts #funny #bars'", tag: "post" },
      { id: "d1t5", text: "Post both Shorts to TikTok and Instagram Reels too", tag: "post" },
      { id: "d1t6", text: "Reply to EVERY comment within 2 hours", tag: "engage" },
    ]},
    { day: "Day 2", color: T.or, tasks: [
      { id: "d2t1", time: "2:00 PM", text: "Cut Clip 3 (0:34–0:48): 'Credit card crying, life too fast, ghosting' → add 'CREDIT CARD CRYING 💳😭' text", tag: "clip" },
      { id: "d2t2", time: "2:00 PM", text: "Upload Clip 3 as YouTube Short. Caption: 'This bar hit too close to home 😭💳 #shorts #hiphop #realrap'", tag: "post" },
      { id: "d2t3", time: "6:00 PM", text: "Cut Clip 4 (0:41–0:58): 'If I smell like trouble, I'm already kinetic' → add 'ALREADY KINETIC ⚡' text", tag: "clip" },
      { id: "d2t4", time: "6:00 PM", text: "Upload Clip 4 as YouTube Short. Caption: 'This line is INSANE 🔥⚡ #shorts #bars #fire #hiphop'", tag: "post" },
      { id: "d2t5", text: "Share clips to r/hiphopheads, r/japanlife, hip-hop Discord servers", tag: "post" },
      { id: "d2t6", text: "Reply to all comments. Pin the best one on each Short", tag: "engage" },
    ]},
    { day: "Day 3", color: T.yl, tasks: [
      { id: "d3t1", time: "2:00 PM", text: "Cut Clip 5 (0:00–0:17): Opening 'HASHIRE' hook + Okinawa visuals → add 'HASHIRE 🇯🇵🔥' text", tag: "clip" },
      { id: "d3t2", time: "2:00 PM", text: "Upload Clip 5. Caption: 'Filmed this in OKINAWA 🇯🇵🔥 Full vid on my channel #shorts #okinawa #japan'", tag: "post" },
      { id: "d3t3", time: "6:00 PM", text: "Cut Clip 6 (0:58–1:16): Second verse chorus reprise → add 'WALLET EMPTY 💀' text", tag: "clip" },
      { id: "d3t4", time: "6:00 PM", text: "Upload Clip 6. Caption: 'POV: Japan life hits different when you're broke 💀🇯🇵 #shorts #struggle #japan'", tag: "post" },
      { id: "d3t5", text: "Cross-post ALL 6 Shorts to TikTok and Instagram Reels", tag: "post" },
    ]},
    { day: "Day 4-5", label: "REPOST + ENGAGE", color: T.bl2, tasks: [
      { id: "d4t1", text: "Check YouTube Studio: which Short got the most views? Note it down", tag: "analyze" },
      { id: "d4t2", text: "Repost your best-performing Short to TikTok with a different caption angle", tag: "post" },
      { id: "d4t3", text: "Post community poll: 'Which bar hit hardest? 💀' with clip screenshots", tag: "engage" },
      { id: "d4t4", text: "Reply to every comment on every Short and the full video", tag: "engage" },
    ]},
    { day: "Day 6-7", label: "ANALYZE + PLAN NEXT", color: T.pu, tasks: [
      { id: "d6t1", text: "Check YouTube Studio: total views across all Shorts + full video", tag: "analyze" },
      { id: "d6t2", text: "Identify which clip format performed best (punchline? visuals? relatable bars?)", tag: "analyze" },
      { id: "d6t3", text: "Start planning your NEXT video — use what worked from this week", tag: "plan" },
    ]},
  ];

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 14px 80px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 800 }}>My 7-Day Plan</h2>
          <Badge c={T.or} g={T.og}>HASHIRE</Badge>
        </div>
        <p style={{ fontSize: 12, color: T.tm }}>Your growth plan for "HASHIRE – B-Spanner". Check off tasks as you complete them.</p>
      </div>

      {/* Progress bar */}
      <Card d={0.05} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.t }}>{doneCount}/{totalTasks} tasks completed</span>
          <Mono style={{ fontSize: 13, fontWeight: 600, color: pct >= 80 ? T.gr : pct >= 40 ? T.yl : T.red }}>{pct}%</Mono>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: T.b }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: pct >= 80 ? T.gr : pct >= 40 ? T.yl : T.red, transition: "width 0.3s" }} />
        </div>
      </Card>

      {/* Day cards */}
      {days.map((d, di) => (
        <Card key={di} d={0.08 + di * 0.03} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ padding: "4px 12px", borderRadius: 6, background: d.color + "15", border: `1px solid ${d.color}22` }}>
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 800, color: d.color }}>{d.day}</span>
            </div>
            {d.label && <Badge c={d.color} g={d.color + "15"}>{d.label}</Badge>}
            <Mono style={{ fontSize: 10, color: T.td, marginLeft: "auto" }}>
              {d.tasks.filter(t => checks[t.id]).length}/{d.tasks.length} done
            </Mono>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {d.tasks.map(t => <Task key={t.id} {...t} />)}
          </div>
        </Card>
      ))}

      {/* Reset button */}
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={() => { setChecks({}); localStorage.removeItem(STORAGE_KEY); }} style={{
          padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.b}`,
          background: "transparent", color: T.td, fontSize: 11, cursor: "pointer"
        }}>Reset all checkmarks</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// MAIN APP
// ═══════════════════════════════════
export default function App() {
  const [page, setPage] = useState("plan");
  const [thumbPreset, setThumbPreset] = useState(null);
  const [viewingCampaign, setViewingCampaign] = useState(null);

  function goToThumb(textOverlay, concept) {
    setThumbPreset({ text: textOverlay || "", concept: concept || "" });
    setPage("thumb");
  }

  function handleSaveCampaign(type, data) {
    saveCampaign(type, data);
  }

  function handleViewCampaign(campaign) {
    setViewingCampaign(campaign);
    setPage("campaign-detail");
  }

  const nav = [
    { k: "plan", l: "My Plan", i: "📋" },
    { k: "shorts", l: "Shorts", i: "✂️" },
    { k: "thumb", l: "Thumbnails", i: "🖼️" },
    { k: "audit", l: "Audit", i: "🔍" },
    { k: "demand", l: "Demand", i: "📡" },
    { k: "viral", l: "Patterns", i: "🧬" },
    { k: "gaps", l: "Compete", i: "🎯" },
    { k: "campaigns", l: "Campaigns", i: "📂" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.t, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.bl};border-radius:2px}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        input:focus{outline:none;border-color:${T.red}!important}
      `}</style>

      <nav style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(14px)", background: T.bg + "DD", borderBottom: `1px solid ${T.b}`, padding: "0 10px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 42 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: `linear-gradient(135deg,#FF1A1A,#FF6A2B)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#FFF", fontWeight: 900 }}>Z</div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13 }}>Zupi Growth</span>
            <Badge c={T.gr} g={T.gg}>FREE</Badge>
          </div>
          <div style={{ display: "flex", gap: 1, overflowX: "auto" }}>
            {nav.map(n => (
              <button key={n.k} onClick={() => setPage(n.k)} style={{
                padding: "4px 7px", borderRadius: 5, border: "none",
                background: page === n.k ? T.s3 : "transparent",
                color: page === n.k ? T.t : T.tm,
                fontSize: 10, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap"
              }}>
                <span style={{ fontSize: 10 }}>{n.i}</span>{n.l}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {page === "plan" && <MyPlan />}

      {page === "shorts" && <ShortsClipper onCreateThumb={goToThumb} onSave={(data) => handleSaveCampaign("shorts", data)} />}

      {page === "thumb" && <ThumbnailMaker preset={thumbPreset} onPresetUsed={() => setThumbPreset(null)} />}

      {page === "audit" && <VideoAuditPage onSave={(data) => handleSaveCampaign("audit", data)} />}

      {page === "demand" && (
        <AIPage title="AI Demand Scanner" icon="📡" desc="High-demand topics with zero competition."
          placeholder="Your niche..." btnText="Scan" fallback={demoDemand}
          quickPicks={["AI & Tech", "Gaming", "Fitness", "Finance", "Cooking", "Music"]}
          prompt={q => `Find TOP 4 topics for "${q}" with highest organic viral potential. Return JSON: {"topics":[{"topic":"title","gapScore":0-100,"searchVolume":"X/mo","trend":"↑X%","difficulty":"Easy/Medium/Hard","format":"type","timing":"NOW/This week/Evergreen","estimatedViews":"range","whyItWorks":"why","titleSuggestion":"title"}]} Sort by gapScore.`}
          sys="YouTube trend analyst. Valid JSON only."
          renderResult={renderDemand}
          onSave={(data) => handleSaveCampaign("demand", data)} />
      )}

      {page === "viral" && (
        <AIPage title="AI Viral Patterns" icon="🧬" desc="Formats driving massive views right now."
          placeholder="Your niche..." btnText="Detect" fallback={demoViral}
          quickPicks={["AI & Tech", "Gaming", "Fitness", "Finance"]}
          prompt={q => `Find TOP 3 viral patterns in "${q}" driving 100K+ organic views. Return JSON: {"patterns":[{"pattern":"name","heatScore":0-100,"rising":true/false,"avgViews":"range","whyItWorks":"why","gapOpportunity":"gap","actionToday":"action","titleTemplate":"template"}]}`}
          sys="YouTube content strategist. Valid JSON only."
          renderResult={renderViral}
          onSave={(data) => handleSaveCampaign("viral", data)} />
      )}

      {page === "gaps" && (
        <AIPage title="AI Competitor Analysis" icon="🎯" desc="Find weaknesses. Steal audiences."
          placeholder="Competitor or niche..." btnText="Analyze" fallback={demoCompetitors}
          prompt={q => `Analyze "${q}". 2 competitors, weaknesses, steal strategies. Return JSON: {"overallStrategy":"plan","quickWins":["w1","w2","w3"],"competitors":[{"name":"ch","estimatedSubs":"X","estimatedAvgViews":"X","strengths":["s1","s2","s3"],"weaknesses":["w1","w2","w3"],"audienceStealStrategy":"strategy","vulnerabilityScore":0-100}]}`}
          sys="YouTube competitive analyst. Valid JSON only."
          renderResult={renderCompetitors}
          onSave={(data) => handleSaveCampaign("compete", data)} />
      )}

      {page === "campaigns" && <CampaignsPage onView={handleViewCampaign} />}

      {page === "campaign-detail" && <CampaignDetail campaign={viewingCampaign} onBack={() => setPage("campaigns")} />}

      <div style={{ textAlign: "center", padding: "14px", borderTop: `1px solid ${T.b}`, fontSize: 9, color: T.td }}>
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: T.tm }}>Zupi Growth</span> — AI-powered YouTube growth. 100% organic. $0 spent.
      </div>
    </div>
  );
}
