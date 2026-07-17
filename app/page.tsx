"use client";

import { FormEvent, PointerEvent as ReactPointerEvent, useRef, useState } from "react";

type RoomKey = "about" | "writing" | "lab" | "contact";
type ChatMessage = { from: "you" | "rumi"; text: string };

const rooms: Record<RoomKey, { label: string; title: string; subtitle: string; atlas: string }> = {
  about: {
    label: "01 · THE OBSERVATORY",
    title: "About Summer",
    subtitle: "A moving timeline of the places that shaped my work.",
    atlas: "atlas-about",
  },
  writing: {
    label: "02 · THE STORY HOUSE",
    title: "Research & Writing",
    subtitle: "Open the book and wander through my published work.",
    atlas: "atlas-writing",
  },
  lab: {
    label: "03 · THE DESIGN LAB",
    title: "Landscape Journal",
    subtitle: "Light, weather, and the places that make me pause.",
    atlas: "atlas-lab",
  },
  contact: {
    label: "04 · THE MAILBOX",
    title: "Send a Signal",
    subtitle: "Postcards, collaborations, and messages from afar.",
    atlas: "atlas-contact",
  },
};

type PublicationRecord = readonly [year: string, title: string, journal: string, href?: string];

const publications: readonly PublicationRecord[] = [
  ["2026", "Artificial Intelligence and Chatbot-Supported Interventions for Physical Activity and Obesity-related Lifestyle Behaviors: A Scoping Review with Attention to Family Involvement", "JMIR Pediatrics and Parenting · Forthcoming", "https://doi.org/10.2196/98889"],
  ["2026", "The Utilization of Artificial Intelligence-Based Conversational Agents on Mental Health Care for Older Adults: A Scoping Review", "Aging & Mental Health", "https://doi.org/10.1080/13607863.2026.2664078"],
  ["2026", "Artificial Intelligence-Based Social Assistive Robots in Dementia Care: A Systematic Review and Meta-Analysis", "The Gerontologist", "https://doi.org/10.1093/geront/gnag019"],
  ["2025", "Rural–Urban Comparison in Cognitive Health Among Brazilian Older Adults: The Moderating Role of Internet Use", "Journal of Applied Gerontology"],
  ["2025", "Supporting U.S. Caregivers’ Mental Health: Trends and Correlates Pre-COVID and COVID-Onward", "American Journal of Health Promotion"],
  ["2025", "Social Media Communication, Traditional Social Interactions, and Loneliness in Later Life", "The Journals of Gerontology: Series B"],
  ["2025", "The Long-Term Impact of Childhood Grandparent Co-Residence on Self-Perception of Aging and Depressive Symptoms", "The Journals of Gerontology: Series B"],
  ["2025", "Development and Validation of Equations to Estimate Body Fat Percentage in Older Adults", "Clinical Nutrition ESPEN"],
  ["2025", "A Social Engagement Technology-Based Randomized Controlled Trial for Older Adults", "Contemporary Clinical Trials Communications"],
  ["2025", "The Digital Displacement on Everyday Activities and Happiness Among Chinese Older Adults", "International Journal of Social Welfare"],
  ["2025", "Interactive AI Technology for Dementia Caregivers: Needs and Implementation Evidence", "Journal of Technology in Human Services"],
  ["2025", "Loneliness Among Older Caregivers: An Analysis of the 2020 California Health Interview Survey", "Journal of Applied Gerontology"],
  ["2025", "The Use of Portable A-Mode Ultrasound in Appendicular Lean Mass Measurements Among Older Adults", "European Journal of Clinical Nutrition"],
  ["2024", "Intra- and Inter-Rater Reliability of Muscle and Fat Thickness Measurements Using Portable Ultrasonography", "Clinical Nutrition ESPEN"],
  ["2023", "Gender Disparities in Telehealth Use Among Older Adults in the United States During COVID-19", "International Journal of Population Studies"],
  ["2023", "Doctors’ Recommendations and Healthy Lifestyle Behaviors Among Adults With Hypertension in Brazil", "Preventive Medicine Reports"],
  ["2023", "Keeping Up With Technology: Socioemotional and Equity Challenges", "Children & Schools"],
  ["2022", "Aging in Chinatowns: The Meaning of Place and Aging Experience for Older Immigrants", "Journal of Cross-Cultural Gerontology"],
  ["2022", "A Biopsychosocial Examination of Chronic Back Pain, Limitations on Usual Activities, and Treatment in Brazil", "PLOS ONE"],
  ["2022", "Patterns in Older Adults’ Perceived Chronic Stressor Types and Cognitive Functioning Trajectories", "Social Science & Medicine"],
  ["2021", "Longitudinal Associations Between Cancer History and Cognitive Functioning Among Older Adults", "Archives of Gerontology and Geriatrics"],
];

const suggestions = ["I feel stressed", "Help me ground myself", "I can’t sleep", "I feel alone"];

const photoJournal = [
  ["/photos/landscape-01.jpg", "Flags in the wind", "a world in motion"],
  ["/photos/landscape-02.jpg", "Archive geometry", "lines · light · repetition"],
  ["/photos/landscape-03.jpg", "Blue encounter", "underwater wonder"],
  ["/photos/landscape-04.jpg", "Quiet lines", "space and stillness"],
  ["/photos/landscape-05.jpg", "Spring in bloom", "soft beginnings"],
  ["/photos/landscape-06.jpg", "Sunlit façade", "warm afternoon"],
  ["/photos/landscape-07.jpg", "A familiar corner", "architecture and memory"],
  ["/photos/landscape-08.jpg", "Under the old tree", "ordinary life"],
  ["/photos/landscape-09.jpg", "Season turning", "green into gold"],
  ["/photos/landscape-10.jpg", "White New York", "city in quiet light"],
  ["/photos/landscape-11.jpg", "Autumn in Champaign", "a golden pause"],
] as const;

function crisisReply(text: string) {
  if (!/suicid|kill myself|hurt myself|self[- ]?harm|end my life|不想活|自杀|伤害自己/i.test(text)) return null;
  return "I’m really glad you told me. If you might act on these thoughts or are in immediate danger, call 911 now. In the U.S., call or text 988 for free, confidential crisis support. If you can, move near another person and tell someone you trust: ‘I’m not feeling safe and need you to stay with me.’";
}

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [room, setRoom] = useState<RoomKey | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "rumi", text: "Hi, I’m RUMI. I can help you slow down, ground yourself, and think through a stressful moment. What feels hardest right now?" },
  ]);
  const [rumiThinking, setRumiThinking] = useState(false);

  function handleParallax(event: ReactPointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--parallax-x", `${x * -18}px`);
    event.currentTarget.style.setProperty("--parallax-y", `${y * -12}px`);
  }

  function enterRoom(key: RoomKey) {
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setRoom(key);
      window.setTimeout(() => setTransitioning(false), 420);
    }, 420);
  }

  function leaveRoom() {
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setRoom(null);
      window.setTimeout(() => setTransitioning(false), 420);
    }, 420);
  }

  async function askRumi(question: string) {
    const clean = question.trim();
    if (!clean || rumiThinking) return;
    const userMessage: ChatMessage = { from: "you", text: clean };
    const safetyMessage = crisisReply(clean);
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput("");
    if (safetyMessage) {
      setMessages((previous) => [...previous, { from: "rumi", text: safetyMessage }]);
      return;
    }
    setRumiThinking(true);
    try {
      const response = await fetch("/api/rumi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation.slice(-12) }),
      });
      const data = await response.json() as { reply?: string; error?: string };
      if (!response.ok || !data.reply) throw new Error(data.error || "RUMI could not answer");
      setMessages((previous) => [...previous, { from: "rumi", text: data.reply as string }]);
    } catch {
      setMessages((previous) => [...previous, { from: "rumi", text: "My ChatGPT connection is resting for a moment. Please try again soon. If you feel unsafe or may hurt yourself, call or text 988 in the U.S., or contact local emergency services." }]);
    } finally {
      setRumiThinking(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    askRumi(input);
  }

  return (
    <main className="game-shell">
      <section className={`arrival ${entered ? "arrival--gone" : ""}`} aria-hidden={entered}>
        <div className="arrival__backdrop" />
        <div className="arrival__wash" />
        <img className="arrival__rumi" src="/rumi-character.png" alt="RUMI, a Shiba Inu" />
        <div className="arrival__content">
          <p className="kicker">XIAYU “SUMMER” CHEN · AN INTERACTIVE WORLD</p>
          <h1>Follow the light.<br /><em>Find the stories.</em></h1>
          <p className="arrival__lede">A small, living world of care, research, photography, and the places that shaped me—with RUMI waiting nearby.</p>
          <button className="enter-button" onClick={() => setEntered(true)}><span>Enter Summer’s world</span><b>→</b></button>
          <p className="sound-note">No controls to learn · simply choose a cottage</p>
        </div>
      </section>

      {!room && (
        <section className="world" aria-label="Summer's world map" onPointerMove={handleParallax}>
          <div className="world__image" />
          <div className="sky-glow" />
          <Ambient kind="world" />
          <header className="topbar">
            <div className="brand"><span className="brand__sun">S</span><span><b>SUMMER’S WORLD</b><small>CHOOSE · DISCOVER · ENTER</small></span></div>
            <div className="controls-note"><span>Four rooms, one evolving story</span></div>
            <button className="ask-button" onClick={() => setChatOpen(true)}><img src="/rumi-character.png" alt="" /> Ask RUMI</button>
          </header>

          {(Object.keys(rooms) as RoomKey[]).map((key) => (
            <button key={key} onClick={() => enterRoom(key)} className={`door-marker door-marker--${key}`} aria-label={`Enter ${rooms[key].title}`}>
              <i /><b>{rooms[key].label.split(" · ")[1]}</b><small>OPEN THE DOOR</small>
            </button>
          ))}

          <button className="world-rumi" onClick={() => setChatOpen(true)} aria-label="Chat with RUMI">
            <span /><img src="/rumi-character.png" alt="RUMI, the Shiba Inu" /><small>RUMI · TALK TO ME</small>
          </button>

          <div className="quest-card"><small>CLICK-TO-EXPLORE WORLD</small><b>Which door calls to you?</b><p>Select any glowing cottage. RUMI stays here whenever you need a calm moment.</p></div>
        </section>
      )}

      {room && <CottagePage room={room} onLeave={leaveRoom} onChat={() => setChatOpen(true)} />}
      <div className={`portal-wipe ${transitioning ? "portal-wipe--active" : ""}`}><i /></div>

      <aside className={`chat ${chatOpen ? "chat--open" : ""}`} aria-label="Mental wellness chat with RUMI">
        <div className="chat__header"><img src="/rumi-character.png" alt="" /><div><small>MENTAL WELL-BEING COMPANION</small><b>RUMI</b></div><button onClick={() => setChatOpen(false)} aria-label="Close chat">×</button></div>
        <div className="chat__messages">{messages.map((message, index) => <p key={index} className={`message message--${message.from}`}>{message.text}</p>)}{rumiThinking && <p className="message message--rumi message--thinking">RUMI is thinking<span>…</span></p>}</div>
        <div className="suggestions">{suggestions.map((item) => <button key={item} disabled={rumiThinking} onClick={() => askRumi(item)}>{item}</button>)}</div>
        <form onSubmit={submit}><input value={input} disabled={rumiThinking} onChange={(event) => setInput(event.target.value)} placeholder="Tell RUMI what feels hard…" aria-label="Message RUMI" /><button disabled={rumiThinking} aria-label="Send message">→</button></form>
        <p className="chat__safety">RUMI offers general support, not diagnosis or therapy. U.S. crisis support: call/text <a href="https://988lifeline.org/" target="_blank" rel="noreferrer">988</a>.</p>
      </aside>
    </main>
  );
}

function Ambient({ kind }: { kind: "world" | RoomKey }) {
  return <div className={`ambient ambient--${kind}`} aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>;
}

function CottagePage({ room, onLeave, onChat }: { room: RoomKey; onLeave: () => void; onChat: () => void }) {
  const info = rooms[room];
  return (
    <section className={`cottage ${info.atlas}`} aria-label={info.title}>
      <div className="cottage__backdrop" /><div className="cottage__shade" /><Ambient kind={room} />
      <header className="cottage__topbar"><button onClick={onLeave}>← Return to world</button><span>{info.label}</span><button onClick={onChat}>Ask RUMI</button></header>
      <div className="room-motion" aria-hidden="true"><i /><i /><i /><i /></div>
      <article className={`cottage__content cottage__content--${room}`}>
        <p className="room-label">{info.label}</p><h2>{info.title}</h2><p className="room-subtitle">{info.subtitle}</p>
        {room === "about" && <AboutRoom />}
        {room === "writing" && <WritingRoom />}
        {room === "lab" && <LabRoom />}
        {room === "contact" && <ContactRoom />}
      </article>
    </section>
  );
}

function AboutRoom() {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => track.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  return (
    <div className="room-copy about-copy">
      <div className="about-intro">
        <figure className="profile-polaroid"><img src="/photos/summer-profile.jpg" alt="Xiayu Summer Chen by the water" /><figcaption>Summer · by the water</figcaption></figure>
        <div><small>HELLO, I’M SUMMER</small><p className="about-lede">Xiayu Summer Chen is an Assistant Professor at UCF’s School of Social Work and a trained oncology social worker working at the intersection of gerontology, health disparities, and technology for social good.</p></div>
      </div>
      <div className="education-heading"><span>EDUCATION · SWIPE THROUGH THE YEARS</span><div><button onClick={() => move(-1)} aria-label="Previous education card">←</button><button onClick={() => move(1)} aria-label="Next education card">→</button></div></div>
      <div className="education-track" ref={track}>
        <article><small>2013 — 2017 · BEIJING</small><b>Tsinghua University</b><p>B.S. Psychology<br />B.B.A. Business Management</p><i>01</i></article>
        <article><small>2017 — 2019 · NEW YORK</small><b>New York University</b><p>Master of Social Work<br />Silver School of Social Work</p><i>02</i></article>
        <article><small>2021 — 2025 · ILLINOIS</small><b>University of Illinois Urbana-Champaign</b><p>Ph.D. Social Work<br />School of Social Work</p><i>03</i></article>
      </div>
      <p className="swipe-hint">Drag or use the arrows to follow the path from undergraduate study to the doctorate.</p>
    </div>
  );
}

function WritingRoom() {
  const [spread, setSpread] = useState(0);
  const pages = Math.ceil(publications.length / 4);
  const visible = publications.slice(spread * 4, spread * 4 + 4);
  return (
    <div className="room-copy writing-copy">
      <a className="special-call" href="https://www.lumoscience.com/Journals/GH/Special-Issues/DHSC-AS" target="_blank" rel="noreferrer">
        <div className="special-call__eyebrow"><span>CALL FOR PAPERS</span><small>GERIATRICS AND HEALTHCARE · SPECIAL ISSUE</small></div>
        <div className="special-call__body">
          <div><p>GUEST EDITED BY XIAYU SUMMER CHEN &amp; KUN WANG</p><h3>Digital Health and Smart Care in the Aging Society</h3></div>
          <span className="special-call__arrow">↗</span>
        </div>
        <div className="special-call__details"><b>Deadline · 31 December 2026</b><b>APC waived for all accepted articles</b><span>Read the full call</span></div>
      </a>
      <div className="book" key={spread}>
        <div className="book__spine" />
        <div className="book__page book__page--left">
          <small className="folio">SUMMER’S RESEARCH NOTES · {spread + 1}</small>
          {visible.slice(0, 2).map((paper) => <Publication paper={paper} key={paper[1]} />)}
        </div>
        <div className="book__page book__page--right">
          <small className="folio">SELECTED PUBLICATIONS · {spread + 1}</small>
          {visible.slice(2, 4).map((paper) => <Publication paper={paper} key={paper[1]} />)}
        </div>
      </div>
      <div className="book-controls"><button disabled={spread === 0} onClick={() => setSpread((value) => value - 1)}>← Previous pages</button><span>{spread + 1} / {pages}</span><button disabled={spread === pages - 1} onClick={() => setSpread((value) => value + 1)}>Turn the page →</button></div>
      <a className="scholar-link" href="https://scholar.google.com/citations?user=IqvC3esAAAAJ" target="_blank" rel="noreferrer">View the complete, continuously updated list on Google Scholar ↗</a>
    </div>
  );
}

function Publication({ paper }: { paper: PublicationRecord }) {
  const href = paper[3] ?? `https://scholar.google.com/scholar?q=${encodeURIComponent(`Xiayu Chen ${paper[1]}`)}`;
  return <a className="publication" href={href} target="_blank" rel="noreferrer"><span>{paper[0]}</span><b>{paper[1]}</b><small>{paper[2]} · READ ↗</small></a>;
}

function LabRoom() {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => track.current?.scrollBy({ left: direction * 620, behavior: "smooth" });
  return (
    <div className="room-copy lab-copy">
      <div className="gallery-heading"><p className="gallery-note">Photography is how I collect the places, colors, and small details I want to remember.</p><div><button onClick={() => move(-1)} aria-label="Previous photographs">←</button><button onClick={() => move(1)} aria-label="Next photographs">→</button></div></div>
      <div className="polaroid-track" ref={track}>
        {photoJournal.map(([src, title, note], index) => (
          <figure className={`polaroid polaroid--${index % 5}`} key={src}>
            <img src={src} alt={title} />
            <figcaption><b>{title}</b><span>{note}</span><i>{String(index + 1).padStart(2, "0")}</i></figcaption>
          </figure>
        ))}
      </div>
      <p className="photo-status">MY PHOTO JOURNAL · DRAG OR USE THE ARROWS TO WANDER</p>
    </div>
  );
}

function ContactRoom() {
  return <div className="room-copy"><div className="postcard"><small>POSTCARD FROM SUMMER’S WORLD</small><h3>Let’s make something meaningful.</h3><a href="mailto:chen.xiayu@ucf.edu">chen.xiayu@ucf.edu <span>→</span></a></div><a className="faculty-link" href="https://healthprofessions.ucf.edu/person/summer-chen/" target="_blank" rel="noreferrer">Visit UCF faculty page ↗</a><p className="memberships">GSA · AGESW · SSWR</p></div>;
}
